import * as THREE from 'three'
import useStore from '../store/useStore'
import { levelsData } from '../data/levelsData'

export default class GameEngine {
  constructor(container) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true

    if (container) {
      container.appendChild(this.renderer.domElement)
    }

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(8, 10, 8)
    this.camera.lookAt(0, 0, 0)

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    this.dragOffset = new THREE.Vector3()
    this.selectedBlock = null
    this.initialBlockPos = new THREE.Vector3()
    this.isDragging = false

    this.setupLights()
    this.initLevel()
    this.setupListeners()
    this.setupStoreSubscriptions()

    this.animate = this.animate.bind(this)
    this.renderer.setAnimationLoop(this.animate)
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)
  }

  initLevel() {
    const state = useStore.getState()
    const levelIndex = state.currentLevelIndex
    const level = levelsData[levelIndex]

    // Clear previous level
    if (this.boardGroup) {
      this.scene.remove(this.boardGroup)
    }

    this.boardGroup = new THREE.Group()
    this.scene.add(this.boardGroup)

    const { width, height } = level.gridSize
    this.gridWidth = width
    this.gridHeight = height

    // Create Board
    const boardGeo = new THREE.BoxGeometry(width, 0.5, height)
    const boardMat = new THREE.MeshStandardMaterial({ color: '#32292f' })
    const board = new THREE.Mesh(boardGeo, boardMat)
    board.position.y = -0.25
    board.receiveShadow = true
    this.boardGroup.add(board)

    // Center the board
    this.boardGroup.position.set(0, 0, 0)

    // Grid Floor visual
    const gridHelper = new THREE.GridHelper(
      Math.max(width, height),
      Math.max(width, height),
      0x000000,
      0x000000
    )
    gridHelper.position.y = 0.01
    this.boardGroup.add(gridHelper)

    // Walls (optional visual)
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#5a5a5a',
      transparent: true,
      opacity: 0.5,
    })
    const wallThick = 0.2

    // Left Wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, 1, height),
      wallMat
    )
    leftWall.position.set(-width / 2 - wallThick / 2, 0.5, 0)
    this.boardGroup.add(leftWall)

    // Right Wall (with exit)
    const exitY = level.blocks.find((b) => b.isTarget).y
    const exitHeight = 1
    const wallRightGeo = new THREE.BoxGeometry(wallThick, 1, height)
    const rightWall = new THREE.Mesh(wallRightGeo, wallMat)
    rightWall.position.set(width / 2 + wallThick / 2, 0.5, 0)
    // For now skip holes for simplicity, just visual

    // Create Blocks
    this.blocks = []
    level.blocks.forEach((blockData) => {
      const block = this.createBlock(blockData)
      this.boardGroup.add(block)
      this.blocks.push(block)
    })
  }

  createBlock(data) {
    const { length, orientation, color, x, y, id } = data
    const isHorizontal = orientation === 'horizontal'

    const w = isHorizontal ? length : 0.95
    const h = 0.95
    const d = isHorizontal ? 0.95 : length

    const geo = new THREE.BoxGeometry(w, h, d)
    const mat = new THREE.MeshStandardMaterial({ color })
    const mesh = new THREE.Mesh(geo, mat)

    mesh.castShadow = true
    mesh.receiveShadow = true

    // Position
    // Grid relative to center: x is left-to-right, y is top-to-bottom (which is z in 3D)
    mesh.position.x = x - this.gridWidth / 2 + (isHorizontal ? length / 2 : 0.5)
    mesh.position.y = 0.5
    mesh.position.z =
      y - this.gridHeight / 2 + (isHorizontal ? 0.5 : length / 2)

    mesh.userData = { ...data }
    return mesh
  }

  setupStoreSubscriptions() {
    this.unsubscribeLevel = useStore.subscribe(
      (state) => state.currentLevelIndex,
      () => this.initLevel()
    )
  }

  setupListeners() {
    this.handleResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    this.onPointerDown = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.raycaster.intersectObjects(this.blocks)

      if (intersects.length > 0) {
        this.selectedBlock = intersects[0].object
        this.isDragging = true

        const intersection = new THREE.Vector3()
        this.raycaster.ray.intersectPlane(this.dragPlane, intersection)
        this.dragOffset.copy(intersection).sub(this.selectedBlock.position)
        this.initialBlockPos.copy(this.selectedBlock.position)
      }
    }

    this.onPointerMove = (e) => {
      if (!this.isDragging || !this.selectedBlock) return

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersection = new THREE.Vector3()
      if (this.raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
        const targetPos = intersection.sub(this.dragOffset)
        this.moveBlock(this.selectedBlock, targetPos)
      }
    }

    this.onPointerUp = () => {
      if (this.selectedBlock) {
        // Snap to grid
        const newX = Math.round(
          this.selectedBlock.position.x +
            this.gridWidth / 2 -
            (this.selectedBlock.userData.orientation === 'horizontal'
              ? this.selectedBlock.userData.length / 2
              : 0.5)
        )
        const newZ = Math.round(
          this.selectedBlock.position.z +
            this.gridHeight / 2 -
            (this.selectedBlock.userData.orientation === 'horizontal'
              ? 0.5
              : this.selectedBlock.userData.length / 2)
        )

        const oldX = this.selectedBlock.userData.x
        const oldY = this.selectedBlock.userData.y

        if (newX !== oldX || newZ !== oldY) {
          useStore.getState().incrementMoves()
          this.selectedBlock.userData.x = newX
          this.selectedBlock.userData.y = newZ

          this.checkWin()
        }

        // Re-position accurately
        const isH = this.selectedBlock.userData.orientation === 'horizontal'
        this.selectedBlock.position.x =
          newX -
          this.gridWidth / 2 +
          (isH ? this.selectedBlock.userData.length / 2 : 0.5)
        this.selectedBlock.position.z =
          newZ -
          this.gridHeight / 2 +
          (isH ? 0.5 : this.selectedBlock.userData.length / 2)
      }
      this.selectedBlock = null
      this.isDragging = false
    }

    window.addEventListener('resize', this.handleResize)
    window.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerup', this.onPointerUp)
  }

  moveBlock(block, targetPos) {
    const isH = block.userData.orientation === 'horizontal'
    const len = block.userData.length

    if (isH) {
      const minX = -this.gridWidth / 2 + len / 2
      const maxX =
        this.gridWidth / 2 - len / 2 + (block.userData.isTarget ? 2 : 0) // Allow target to exit
      block.position.x = Math.max(minX, Math.min(maxX, targetPos.x))
      // Check collisions
      this.constrainCollision(block, 'x')
    } else {
      const minZ = -this.gridHeight / 2 + len / 2
      const maxZ = this.gridHeight / 2 - len / 2
      block.position.z = Math.max(minZ, Math.min(maxZ, targetPos.z))
      this.constrainCollision(block, 'z')
    }
  }

  constrainCollision(block, axis) {
    // Basic collision detection with other blocks
    this.blocks.forEach((other) => {
      if (other === block) return

      const b1 = this.getBlockBounds(block)
      const b2 = this.getBlockBounds(other)

      if (this.intersects(b1, b2)) {
        if (axis === 'x') {
          if (block.position.x > other.position.x) {
            block.position.x = b2.max.x + block.userData.length / 2
          } else {
            block.position.x = b2.min.x - block.userData.length / 2
          }
        } else {
          if (block.position.z > other.position.z) {
            block.position.z = b2.max.z + block.userData.length / 2
          } else {
            block.position.z = b2.min.z - block.userData.length / 2
          }
        }
      }
    })
  }

  getBlockBounds(block) {
    const isH = block.userData.orientation === 'horizontal'
    const len = block.userData.length
    return {
      min: {
        x: block.position.x - (isH ? len / 2 : 0.45),
        z: block.position.z - (isH ? 0.45 : len / 2),
      },
      max: {
        x: block.position.x + (isH ? len / 2 : 0.45),
        z: block.position.z + (isH ? 0.45 : len / 2),
      },
    }
  }

  intersects(a, b) {
    return (
      a.min.x < b.max.x &&
      a.max.x > b.min.x &&
      a.min.z < b.max.z &&
      a.max.z > b.min.z
    )
  }

  checkWin() {
    const level = levelsData[useStore.getState().currentLevelIndex]
    const targetBlock = this.blocks.find((b) => b.userData.isTarget)

    // Win if target block x is past grid width
    const targetX = targetBlock.userData.x + targetBlock.userData.length
    if (targetX >= this.gridWidth) {
      useStore
        .getState()
        .completeLevel(useStore.getState().moves, level.idealMoves)
    }
  }

  animate() {
    this.renderer.render(this.scene, this.camera)
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
    if (this.unsubscribeLevel) this.unsubscribeLevel()
    this.renderer.setAnimationLoop(null)
    this.renderer.dispose()
  }
}
