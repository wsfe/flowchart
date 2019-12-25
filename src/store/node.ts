import { IFlowChartNode, IControlStyle, IControlAnchor, ICanvasCoordinate, IControl } from '../interfaces'
import { DEFAULT_CONTROL_STYLE, DEFAULT_ANCHORS } from '../const'
import { controlMap } from './control-map'
import { getRadian } from '../utils'
import { getAnchorCoordinate } from '../utils/node'
import Vue from 'vue'
import uuid from 'uuid/v4'
import cloneDeep from 'lodash.clonedeep'

export class FlowChartNode implements IFlowChartNode {
  readonly id!: string

  controlName!: string

  // 设定上 x, y 不受 rotate 影响
  style: IControlStyle = Object.assign({}, DEFAULT_CONTROL_STYLE)

  nodeData!: { [key: string]: any }

  constructor (options: IFlowChartNode) {
    this.id = options.id || uuid()
    this.controlName = options.controlName

    const control = this.control
    Object.assign(this.style, (
      control.defaultWidth != null ? { width: control.defaultWidth } : {}
    ), (
      control.defaultHeight != null ? { height: control.defaultHeight } : {}
    ), options.style)

    this.nodeData = cloneDeep(options.nodeData) || {}
  }

  setData (valueObj: { [key: string]: any }): boolean {
    const keys = Object.getOwnPropertyNames(valueObj)
    if (!keys.length) return false
    keys.forEach((key) => {
      Vue.set(this.nodeData, key, valueObj[key])
    })
    return true
  }

  deleteData (keys: string[]): boolean {
    if (!keys.length) return false
    keys.forEach((key) => {
      Vue.delete(this.nodeData, key)
    })
    return true
  }

  /**
   * 根据偏移量移动节点
   * @param offset 偏移量
   */
  moveByOffset (offset: ICanvasCoordinate) {
    this.style.x += offset.x
    this.style.y += offset.y
  }

  // #region 获取节点信息相关方法

  /**
   * 获取节点容器宽高，因为在节点旋转后，节点宽高不等于容器宽高，所以需要这个方法
   * @param style 节点位置信息
   */
  getNodeContainerSize () {
    const { width, height, rotate } = this.style
    const radian = getRadian(rotate)
    const containerWidth = width * Math.abs(Math.cos(radian)) + height * Math.abs(Math.sin(radian))
    const containerHeight = width * Math.abs(Math.sin(radian)) + height * Math.abs(Math.cos(radian))
    return {
      width: containerWidth,
      height: containerHeight,
    }
  }

  /**
   * 获取锚点相对于画布的坐标位置
   * @param anchor 锚点位置信息
   */
  getAnchorCoordinate (anchor: IControlAnchor): ICanvasCoordinate {
    const containerSize = this.getNodeContainerSize()
    return getAnchorCoordinate(this.style, containerSize, anchor)
  }

  // #endregion 获取节点信息相关方法

  // #region Getters

  get z (): number {
    const result = Number(this.style.z)
    return isNaN(result) ? 0 : result
  }

  /** 节点对应控件 */
  get control (): IControl {
    return controlMap[this.controlName] || {}
  }

  get anchors (): IControlAnchor[] {
    if (!this.control) return []
    return this.control.anchors || DEFAULT_ANCHORS
  }

  /** 获取节点中心坐标点 */
  get center (): ICanvasCoordinate {
    const { x, y, width, height } = this.style
    return {
      x: Math.trunc(x + width / 2),
      y: Math.trunc(y + height / 2),
    }
  }

  // #endregion Getters
}
