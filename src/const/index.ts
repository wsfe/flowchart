export const CLASS_PREFIX = 'ws-flowchart'

/** 连线类型 */
export enum linkTypeEnum {
  /** 直线 */
  straight = 'straight',
  /** 贝塞尔曲线 */
  bezier = 'bezier',
  /** 折线 */
  polyline = 'polyline',
}

/** 方向键，上下左右 */
export enum arrowKeyEnum {
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
}

export * from './defaults'
