import { IFlowChartLink, IControlAnchor, ICanvasCoordinate } from '../interfaces'
import { linkTypeEnum } from '../const'
import { getDistance } from '../utils'
import Vector from '../utils/connection/vector'
import Vue from 'vue'
import uuid from 'uuid/v4'
import cloneDeep from 'lodash.clonedeep'
import { FlowChartNode } from './node'

export class FlowChartLink implements IFlowChartLink {
  static nodes: FlowChartNode[]

  readonly id!: string

  linkType!: keyof typeof linkTypeEnum

  polylinePoints!: ICanvasCoordinate[]

  startNodeId?: string | null

  startAnchor!: IControlAnchor

  startCoordinate!: ICanvasCoordinate

  endNodeId?: string | null

  endAnchor!: IControlAnchor

  endCoordinate!: ICanvasCoordinate

  editorPosition: number = 0.5

  z: number = 0

  linkData!: {
    [key: string]: any,
    text: string,
  }

  constructor (options: IFlowChartLink) {
    this.id = options.id || uuid()
    this.linkType = options.linkType || linkTypeEnum.straight
    this.polylinePoints = options.polylinePoints || []
    this.startNodeId = options.startNodeId
    this.startAnchor = Object.assign({ x: 0, y: 0 }, options.startAnchor)
    this.startCoordinate = Object.assign({ x: 0, y: 0 }, options.startCoordinate)
    this.endNodeId = options.endNodeId
    this.endAnchor = Object.assign({ x: 0, y: 0 }, options.endAnchor)
    this.endCoordinate = Object.assign({ x: 0, y: 0 }, options.endCoordinate)
    this.editorPosition = typeof options.editorPosition === 'number' ? options.editorPosition : this.editorPosition
    this.z = options.z || this.z
    this.linkData = Object.assign({ text: '' }, cloneDeep(options.linkData) || {})
  }

  setData (valueObj: { [key: string]: any }): boolean {
    const keys = Object.getOwnPropertyNames(valueObj)
    if (!keys.length) return false
    keys.forEach((key) => {
      Vue.set(this.linkData, key, valueObj[key])
    })
    return true
  }

  deleteData (keys: string[]): boolean {
    if (!keys.length) return false
    keys.forEach((key) => {
      Vue.delete(this.linkData, key)
    })
    return true
  }

  /**
   * 根据偏移量移动连线
   * @param offset 偏移量
   */
  moveByOffset (offset: ICanvasCoordinate) {
    if (!this.startNodeId) {
      this.startCoordinate.x += offset.x
      this.startCoordinate.y += offset.y
    }
    if (!this.endNodeId) {
      this.endCoordinate.x += offset.x
      this.endCoordinate.y += offset.y
    }
    if (this.linkType === linkTypeEnum.polyline) {
      this.movePolylinePointsByOffset(offset)
    }
  }

  /**
   * 根据偏移量平移所有拐点
   * @param offset 偏移量
   */
  private movePolylinePointsByOffset (offset: ICanvasCoordinate) {
    this.polylinePoints = this.polylinePoints.map((point) => ({
      x: point.x + offset.x,
      y: point.y + offset.y,
    }))
  }

  /** 是否自由连线 */
  isLinkFree (): boolean {
    return !this.startNodeId || !this.endNodeId
  }

  /**
   * 设置折线位置
   * @param polylineIndex 折线组索引
   * @param position 折线走向垂直方向新位置数值
   */
  setPolylinePosition (polylineIndex: number, position: number) {
    const groupLength = this.polylinePoints.length - 1
    if (polylineIndex <= 0 || polylineIndex >= groupLength - 1 || groupLength < 3) return
    const p1 = this.polylinePoints[polylineIndex]
    const p2 = this.polylinePoints[polylineIndex + 1]
    if (p1.x === p2.x) {
      p1.x = position
      p2.x = position
    } else {
      p1.y = position
      p2.y = position
    }
  }

  /**
   * 根据折线组获取折线走向是 x 还是 y
   * @param polylineIndex 折线组索引
   */
  getPolylineDirectionByIndex (polylineIndex: number): 'x' | 'y' | null {
    const pathGroups = this.pathGroups
    const groupLength = pathGroups.length
    if (polylineIndex < 0 || polylineIndex > groupLength - 1 || groupLength < 1) return null
    const group = pathGroups[polylineIndex]
    return group.start.x === group.end.x ? 'y' : 'x'
  }

  // #region Getters

  /** 连线实际起点 */
  get startCoordinate_ (): ICanvasCoordinate {
    if (this.startNodeId) {
      const node = FlowChartLink.nodes.find((n) => n.id === this.startNodeId)
      if (node) {
        return node.getAnchorCoordinate(this.startAnchor)
      }
    }
    return this.startCoordinate
  }

  /** 连线实际终点 */
  get endCoordinate_ (): ICanvasCoordinate {
    if (this.endNodeId) {
      const node = FlowChartLink.nodes.find((n) => n.id === this.endNodeId)
      if (node) {
        return node.getAnchorCoordinate(this.endAnchor)
      }
    }
    return this.endCoordinate
  }

  get pathGroups (): Array<{ start: ICanvasCoordinate, end: ICanvasCoordinate, isPolyline: boolean }> {
    const { linkType, polylinePoints } = this
    if (linkType === linkTypeEnum.straight || linkType === linkTypeEnum.bezier) {
      return [{
        start: this.startCoordinate_,
        end: this.endCoordinate_,
        isPolyline: false,
      }]
    } else {
      const group: Array<{ start: ICanvasCoordinate, end: ICanvasCoordinate, isPolyline: boolean }> = []
      const length = polylinePoints.length
      polylinePoints.forEach((p, i) => {
        if (polylinePoints[i + 1]) {
          group.push({
            start: p,
            end: polylinePoints[i + 1],
            isPolyline: i !== 0 && i !== length - 2,
          })
        }
      })
      return group
    }
  }

  /** 连线长度 */
  get pathLength (): number {
    if (this.linkType === linkTypeEnum.polyline) {
      return this.pathGroups.reduce((sum, current) => {
        return sum + getDistance(current.start, current.end)
      }, 0)
    } else {
      return getDistance(this.startCoordinate_, this.endCoordinate_)
    }
  }

  /** 连线编辑器中间坐标 */
  get editorCenterCoordinate (): ICanvasCoordinate {
    const { startCoordinate_, endCoordinate_ } = this
    if (this.editorPosition === 0) return startCoordinate_
    if (this.editorPosition === 1) return endCoordinate_
    const c = this.pathLength * this.editorPosition
    if (this.linkType === linkTypeEnum.polyline) {
      const { pathGroups } = this
      let polylineIndex = 0
      let accumulation = 0
      pathGroups.some((group) => {
        const length = accumulation + getDistance(group.start, group.end)
        if (length > c) return true
        accumulation = length
        polylineIndex++
        return false
      })
      const rest = c - accumulation
      const direction = this.getPolylineDirectionByIndex(polylineIndex)
      if (!direction) return startCoordinate_
      const start = pathGroups[polylineIndex].start
      const end = pathGroups[polylineIndex].end
      if (direction === 'x') {
        const factor = (end.x - start.x) / Math.abs(end.x - start.x)
        return {
          x: Math.trunc(start.x + rest * factor),
          y: Math.trunc(start.y),
        }
      } else {
        const factor = (end.y - start.y) / Math.abs(end.y - start.y)
        return {
          x: Math.trunc(start.x),
          y: Math.trunc(start.y + rest * factor),
        }
      }
    } else {
      // 根据向量叉乘模 = 0 与长度公式计算
      // 向量叉乘模： x1y2 - x2y1 = 0 => ax - by = 0
      // 长度公式： x^2 + y^2 = c^2
      const a = endCoordinate_.y - startCoordinate_.y
      const b = endCoordinate_.x - startCoordinate_.x
      let x: number
      let y: number
      if (b === 0) {
        // 防止 NaN
        x = 0
        y = a * c < 0 ? -c : c
      } else {
        const bDa = a / b
        x = Math.sqrt(Math.pow(c, 2) / (1 + Math.pow(bDa, 2)))
        y = bDa * x
        // 判断是否同向
        if (new Vector(b, a).cosine(new Vector(x, y)) < 0) {
          x = -x
          y = -y
        }
      }
      return {
        x: Math.trunc(x + startCoordinate_.x),
        y: Math.trunc(y + startCoordinate_.y),
      }
    }
  }

  // #endregion Getters
}
