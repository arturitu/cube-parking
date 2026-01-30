import * as THREE from 'three'

export default class Block {
  constructor(data, gridWidth, gridHeight, index) {
    this.data = data
    this.gridWidth = gridWidth
    this.gridHeight = gridHeight
    this.index = index
    this.position = new THREE.Vector3()
    this.updatePosition()
  }

  updatePosition = () => {
    const isH = this.data.orientation === 'horizontal'
    const length = this.data.length

    this.position.x =
      this.data.x - this.gridWidth / 2 + (isH ? length / 2 : 0.5)
    this.position.y = 0.5
    this.position.z =
      this.data.y - this.gridHeight / 2 + (isH ? 0.5 : length / 2)
  }

  getMatrix = () => {
    const isH = this.data.orientation === 'horizontal'
    const length = this.data.length
    const matrix = new THREE.Matrix4()
    const scale = new THREE.Vector3(
      isH ? length : 0.95,
      0.95,
      isH ? 0.95 : length
    )

    matrix.compose(this.position, new THREE.Quaternion(), scale)
    return matrix
  }

  getIndicatorMatrix = () => {
    const isH = this.data.orientation === 'horizontal'
    const length = this.data.length
    const matrix = new THREE.Matrix4()
    const pos = this.position.clone()
    pos.y = 0.51
    const scale = new THREE.Vector3(
      isH ? length * 0.8 : 0.1,
      0.1,
      isH ? 0.1 : length * 0.8
    )

    matrix.compose(pos, new THREE.Quaternion(), scale)
    return matrix
  }

  getBounds = () => {
    const isH = this.data.orientation === 'horizontal'
    const len = this.data.length
    return {
      min: {
        x: this.position.x - (isH ? len / 2 : 0.45),
        z: this.position.z - (isH ? 0.45 : len / 2),
      },
      max: {
        x: this.position.x + (isH ? len / 2 : 0.45),
        z: this.position.z + (isH ? 0.45 : len / 2),
      },
    }
  }

  snapToGrid = () => {
    const isH = this.data.orientation === 'horizontal'
    const len = this.data.length

    const newX = Math.round(
      this.position.x + this.gridWidth / 2 - (isH ? len / 2 : 0.5)
    )
    const newY = Math.round(
      this.position.z + this.gridHeight / 2 - (isH ? 0.5 : len / 2)
    )

    const hasMoved = newX !== this.data.x || newY !== this.data.y

    this.data.x = newX
    this.data.y = newY
    this.updatePosition()

    return hasMoved
  }
}
