import * as THREE from 'three'
import useStore from '../store/useStore'
import { levelsData } from '../data/levelsData'
import Block from './Block'

export default class GameEngine {
  constructor(container) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.setClearColor(0x000000, 0)

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
    this.camera.lookAt(0, 2, 0)

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

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#4a4349',
    })
    const wallThick = 0.2
    const wallHeight = 0.75

    // Top Wall
    const topWall = new THREE.Mesh(
      new THREE.BoxGeometry(width + wallThick * 2, wallHeight, wallThick),
      wallMat
    )
    topWall.position.set(0, wallHeight / 2, -height / 2 - wallThick / 2)
    this.boardGroup.add(topWall)

    // Bottom Wall
    const bottomWall = new THREE.Mesh(
      new THREE.BoxGeometry(width + wallThick * 2, wallHeight, wallThick),
      wallMat
    )
    bottomWall.position.set(0, wallHeight / 2, height / 2 + wallThick / 2)
    this.boardGroup.add(bottomWall)

    // Left Wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, wallHeight, height),
      wallMat
    )
    leftWall.position.set(-width / 2 - wallThick / 2, wallHeight / 2, 0)
    this.boardGroup.add(leftWall)

    // Right Wall (with exit gap)
    const targetBlockData = level.blocks.find((b) => b.isTarget)
    const exitRow = targetBlockData.y

    if (exitRow > 0) {
      const wallPartTop = new THREE.Mesh(
        new THREE.BoxGeometry(wallThick, wallHeight, exitRow),
        wallMat
      )
      wallPartTop.position.set(
        width / 2 + wallThick / 2,
        wallHeight / 2,
        -height / 2 + exitRow / 2
      )
      this.boardGroup.add(wallPartTop)
    }

    if (exitRow + 1 < height) {
      const bottomHeight = height - (exitRow + 1)
      const wallPartBottom = new THREE.Mesh(
        new THREE.BoxGeometry(wallThick, wallHeight, bottomHeight),
        wallMat
      )
      wallPartBottom.position.set(
        width / 2 + wallThick / 2,
        wallHeight / 2,
        height / 2 - bottomHeight / 2
      )
      this.boardGroup.add(wallPartBottom)
    }

    // Create Blocks logic
    const blockCount = level.blocks.length
    const boxGeo = new THREE.BoxGeometry(1, 1, 1)
    const blockMat = new THREE.MeshStandardMaterial()
    const indicatorMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.3,
    })

    this.blockMesh = new THREE.InstancedMesh(boxGeo, blockMat, blockCount)
    this.indicatorMesh = new THREE.InstancedMesh(
      boxGeo,
      indicatorMat,
      blockCount
    )

    this.blockMesh.castShadow = true
    this.blockMesh.receiveShadow = true

    this.blocks = level.blocks.map((data, i) => {
      const block = new Block(data, this.gridWidth, this.gridHeight, i)
      this.blockMesh.setMatrixAt(i, block.getMatrix())
      this.blockMesh.setColorAt(i, new THREE.Color(data.color))
      this.indicatorMesh.setMatrixAt(i, block.getIndicatorMatrix())
      return block
    })

    this.boardGroup.add(this.blockMesh)
    this.boardGroup.add(this.indicatorMesh)
  }

  setupStoreSubscriptions() {
    this.unsubscribeLevel = useStore.subscribe(
      (state) => state.currentLevelIndex,
      () => this.initLevel()
    )

    this.unsubscribeReset = useStore.subscribe(
      (state) => state.resetToken,
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
      const intersects = this.raycaster.intersectObject(this.blockMesh)

      if (intersects.length > 0) {
        const instanceId = intersects[0].instanceId
        this.selectedBlock = this.blocks[instanceId]
        this.isDragging = true

        const intersection = new THREE.Vector3()
        this.raycaster.ray.intersectPlane(this.dragPlane, intersection)
        this.dragOffset.copy(intersection).sub(this.selectedBlock.position)
        this.initialBlockPos.copy(this.selectedBlock.position)
      }
    }

    this.onPointerMove = (e) => {
      if (!this.isDragging || !this.selectedBlock) {
        return
      }

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersection = new THREE.Vector3()
      if (this.raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
        const targetPos = intersection.sub(this.dragOffset)
        this.moveBlock(this.selectedBlock, targetPos)

        // Sync instanced meshes
        this.blockMesh.setMatrixAt(
          this.selectedBlock.index,
          this.selectedBlock.getMatrix()
        )
        this.indicatorMesh.setMatrixAt(
          this.selectedBlock.index,
          this.selectedBlock.getIndicatorMatrix()
        )
        this.blockMesh.instanceMatrix.needsUpdate = true
        this.indicatorMesh.instanceMatrix.needsUpdate = true
      }
    }

    this.onPointerUp = () => {
      if (this.selectedBlock) {
        const moved = this.selectedBlock.snapToGrid()

        this.blockMesh.setMatrixAt(
          this.selectedBlock.index,
          this.selectedBlock.getMatrix()
        )
        this.indicatorMesh.setMatrixAt(
          this.selectedBlock.index,
          this.selectedBlock.getIndicatorMatrix()
        )
        this.blockMesh.instanceMatrix.needsUpdate = true
        this.indicatorMesh.instanceMatrix.needsUpdate = true

        if (moved) {
          useStore.getState().incrementMoves()
          this.checkWin()
        }
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
    const isH = block.data.orientation === 'horizontal'
    const len = block.data.length

    if (isH) {
      const minX = -this.gridWidth / 2 + len / 2
      const maxX = this.gridWidth / 2 - len / 2 + (block.data.isTarget ? 2 : 0)
      block.position.x = Math.max(minX, Math.min(maxX, targetPos.x))
      this.constrainCollision(block, 'x')
    } else {
      const minZ = -this.gridHeight / 2 + len / 2
      const maxZ = this.gridHeight / 2 - len / 2
      block.position.z = Math.max(minZ, Math.min(maxZ, targetPos.z))
      this.constrainCollision(block, 'z')
    }
  }

  constrainCollision(block, axis) {
    this.blocks.forEach((other) => {
      if (other === block) {
        return
      }

      const b1 = block.getBounds()
      const b2 = other.getBounds()

      if (this.intersects(b1, b2)) {
        if (axis === 'x') {
          if (block.position.x > other.position.x) {
            block.position.x = b2.max.x + block.data.length / 2
          } else {
            block.position.x = b2.min.x - block.data.length / 2
          }
        } else {
          if (block.position.z > other.position.z) {
            block.position.z = b2.max.z + block.data.length / 2
          } else {
            block.position.z = b2.min.z - block.data.length / 2
          }
        }
      }
    })
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
    const targetBlock = this.blocks.find((b) => b.data.isTarget)

    const targetX = targetBlock.data.x + targetBlock.data.length
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
    if (this.unsubscribeReset) this.unsubscribeReset()
    this.renderer.setAnimationLoop(null)
    this.renderer.dispose()
  }
}
