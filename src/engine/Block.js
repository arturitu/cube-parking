import * as THREE from 'three'

export default class Block {
  constructor(data, gridWidth, gridHeight) {
    this.data = { ...data }
    this.gridWidth = gridWidth
    this.gridHeight = gridHeight
    this.group = new THREE.Group()

    this.init()
  }

  init() {
    const { length, orientation, color, x, y } = this.data
    const isH = orientation === 'horizontal'

    const w = isH ? length : 0.95
    const h = 0.95
    const d = isH ? 0.95 : length

    const geo = new THREE.BoxGeometry(w, h, d)
    const mat = new THREE.MeshStandardMaterial({ color })
    this.mesh = new THREE.Mesh(geo, mat)

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.group.add(this.mesh)

    this.group.position.x = x - this.gridWidth / 2 + (isH ? length / 2 : 0.5)
    this.group.position.y = 0.5
    this.group.position.z = y - this.gridHeight / 2 + (isH ? 0.5 : length / 2)

    const indicatorGeo = isH
      ? new THREE.BoxGeometry(length * 0.8, 0.1, 0.1)
      : new THREE.BoxGeometry(0.1, 0.1, length * 0.8)
    const indicatorMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.3,
    })
    const indicator = new THREE.Mesh(indicatorGeo, indicatorMat)
    indicator.position.y = 0.51
    this.group.add(indicator)
  }

  getBounds() {
    const isH = this.data.orientation === 'horizontal'
    const len = this.data.length
    return {
      min: {
        x: this.group.position.x - (isH ? len / 2 : 0.45),
        z: this.group.position.z - (isH ? 0.45 : len / 2),
      },
      max: {
        x: this.group.position.x + (isH ? len / 2 : 0.45),
        z: this.group.position.z + (isH ? 0.45 : len / 2),
      },
    }
  }

  snapToGrid() {
    const isH = this.data.orientation === 'horizontal'
    const len = this.data.length

    const newX = Math.round(
      this.group.position.x + this.gridWidth / 2 - (isH ? len / 2 : 0.5)
    )
    const newY = Math.round(
      this.group.position.z + this.gridHeight / 2 - (isH ? 0.5 : len / 2)
    )

    const hasMoved = newX !== this.data.x || newY !== this.data.y

    this.data.x = newX
    this.data.y = newY

    this.group.position.x = newX - this.gridWidth / 2 + (isH ? len / 2 : 0.5)
    this.group.position.z = newY - this.gridHeight / 2 + (isH ? 0.5 : len / 2)

    return hasMoved
  }
}
