import { IControlStyle, IFlowChartNode, ICanvasSize } from '../interfaces'

/** 控件默认配置 */
export const DEFAULT_CONTROL_CONFIG = {
  /** 在 isEditing 状态改变时拍摄快照，默认 true */
  takeSnapshotOnEditChange: true,
  /** 节点遮罩宽 */
  maskWidth: '100%',
  /** 节点遮罩高 */
  maskHeight: '100%',
  /** 节点遮罩 x 方向偏移量 */
  maskOffsetX: 0,
  /** 节点遮罩 y 方向偏移量 */
  maskOffsetY: 0,
  /** 是否可缩放 */
  resizable: true,
}

/** 控件默认位置信息 */
export const DEFAULT_CONTROL_STYLE: IControlStyle = {
  width: 120,
  height: 72,
  x: 0,
  y: 0,
  z: 0,
  rotate: 0,
}

/** 节点默认数据 */
export const DEFAULT_NODE: IFlowChartNode = {
  id: '',
  controlName: '',
  style: DEFAULT_CONTROL_STYLE,
  nodeData: {},
}

/** 画布默认尺寸 */
export const DEFAULT_CANVAS_SIZE: ICanvasSize = {
  width: 1050,
  height: 1500,
}

/** 默认锚点 */
export const DEFAULT_ANCHORS = [
  // 上
  { x: 0.5, y: 0 },
  // 右
  { x: 1, y: 0.5 },
  // 下
  { x: 0.5, y: 1 },
  // 左
  { x: 0, y: 0.5 },
]
