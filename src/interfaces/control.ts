import { VueConstructor } from 'vue'

/** 锚点信息，取值范围均为 0-1 ，表示相对控件的位置 */
export interface IControlAnchor {
  x: number,
  y: number,
  disableIn?: boolean,
  disableOut?: boolean,
  disableLinkSelf?: boolean,
  maxIn?: number,
  maxOut?: number,
}

/** 预先定义的控件信息 */
export interface IControl {
  /** 控件名称 */
  controlName: string,
  /** 对应 Vue 组件 */
  component: VueConstructor,
  /** 控件是否在拖拽区域显示 */
  hidden?: boolean,
  /** 控件拥有的锚点列表 */
  anchors?: IControlAnchor[],
  /** 控件标签 */
  label?: string,
  /** 控件默认宽度 */
  defaultWidth?: number,
  /** 控件默认高度 */
  defaultHeight?: number,
  /** 控件最小宽度 */
  minWidth?: number,
  /** 控件最小高度 */
  minHeight?: number,
  /** 控件最大宽度 */
  maxWidth?: number,
  /** 控件最大高度 */
  maxHeight?: number,
  /** 禁止连接自身 */
  disableLinkSelf?: boolean,
  /** 最大输入连线条数 */
  maxLinkIn?: number,
  /** 最大输出连线条数 */
  maxLinkOut?: number,
  /** 在 isEditing 状态改变时拍摄快照，默认 true */
  takeSnapshotOnEditChange?: boolean,
  /** 节点遮罩宽 */
  maskWidth?: number | string,
  /** 节点遮罩高 */
  maskHeight?: number | string,
  /** 节点遮罩 x 方向偏移量 */
  maskOffsetX?: number | string,
  /** 节点遮罩 y 方向偏移量 */
  maskOffsetY?: number | string,
  /** 是否可缩放 */
  resizable: boolean,
}

/** 控件位置信息 */
export interface IControlStyle {
  width: number,
  height: number,
  x: number,
  y: number,
  z?: number,
  rotate: number,
}

export interface IControlMap {
  [key: string]: IControl,
}
