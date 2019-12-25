import { ICanvasCoordinate } from '../interfaces'
import { FlowChartData, FlowChartLink, FlowChartNode } from '../store'
import { controlMap } from '../store/control-map'
import { get, getDistance } from './index'

/**
 * 根据两个点获取终止点处对应箭头的三个点
 * @param c1 起始点
 * @param c2 终止点
 * @param arrowWidth 箭头长
 * @param arrowHeight 箭头高
 */
export const getArrowPoints = (c1: ICanvasCoordinate, c2: ICanvasCoordinate, arrowWidth: number, arrowHeight: number): ICanvasCoordinate[] => {
  // 箭头尖偏移量，没有偏移会因为直线宽度有个凸出点，放大了会暴露
  const arrowSharpOffset = 1
  const halfHeight = arrowHeight / 2
  if (c1.x === c2.x) {
    /** middle coordinate */
    const mc: ICanvasCoordinate = {
      x: c1.x,
      y: c1.y < c2.y ? c2.y - arrowWidth : c2.y + arrowWidth,
    }
    return [
      { x: mc.x - halfHeight, y: mc.y },
      { x: mc.x + halfHeight, y: mc.y },
      { x: c2.x, y: c1.y < c2.y ? c2.y + arrowSharpOffset : c2.y - arrowSharpOffset },
    ]
  } else if (c1.y === c2.y) {
    const mc: ICanvasCoordinate = {
      x: c1.x < c2.x ? c2.x - arrowWidth : c2.x + arrowWidth,
      y: c1.y,
    }
    return [
      { x: mc.x, y: mc.y - halfHeight },
      { x: mc.x, y: mc.y + halfHeight },
      { x: c1.x < c2.x ? c2.x + arrowSharpOffset : c2.x - arrowSharpOffset, y: c2.y },
    ]
  } else {
    const radian = Math.atan((c2.y - c1.y) / (c2.x - c1.x))
    const mk = (c1.x - c2.x) / Math.abs(c1.x - c2.x)
    const mc: ICanvasCoordinate = {
      x: c2.x + arrowWidth * Math.cos(radian) * mk,
      y: c2.y + arrowWidth * Math.sin(radian) * mk,
    }
    /** A B C 为 c1, c2 两点直线方程的 A B C （Ax + By + C = 0） */
    const A = (c2.y - c1.y) / (c2.x - c1.x)
    const B = -1
    const C = c1.y - A * c1.x

    /** A 的倒数 */
    const rA = 1 / A
    /** 箭头两端点直线方程中的 b （y = kx + b） */
    const D = rA * mc.x + mc.y

    const numerator = halfHeight * Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2))

    const p1x = (numerator - C + D) / (A + rA)
    const p1y = -rA * p1x + D

    const p2x = (-numerator - C + D) / (A + rA)
    const p2y = -rA * p2x + D

    // 利用相似三角形计算
    /** c1, c2 的距离 */
    const c1c2D = getDistance(c1, c2)
    /** c1 与箭头尖的距离 */
    const c1offsetD = c1c2D + arrowSharpOffset
    const offsetSharpX = c1.x - c1offsetD * (c1.x - c2.x) / c1c2D
    const offsetSharpY = c1.y - c1offsetD * (c1.y - c2.y) / c1c2D

    return [
      { x: p1x, y: p1y },
      { x: p2x, y: p2y },
      { x: offsetSharpX, y: offsetSharpY },
    ]
  }
}

/**
 * 连线操作是否合法，例如是否允许创建、移动连线
 * @param link 要操作的连线
 * @param data 流程图数据
 */
export const isLinkOperationValid = (link: FlowChartLink, data: FlowChartData): boolean => {
  const startNode = link.startNodeId ? data.nodes.find((node) => node.id === link.startNodeId) : null
  const startControl = startNode ? controlMap[startNode.controlName] : null
  const endNode = link.endNodeId ? data.nodes.find((node) => node.id === link.endNodeId) : null
  const endControl = endNode ? controlMap[endNode.controlName] : null

  // 如果连接的是同一个节点，则判断是否允许连接自身节点
  if (startNode != null && startNode === endNode) {
    if (!startControl) return true
    if (startControl.disableLinkSelf) return false
    const anchors = startControl.anchors
    if (!anchors) return true
    // 找到连接的锚点
    const startAnchor = anchors.find((anchor) => anchor.x === link.startAnchor.x && anchor.y === link.startAnchor.y)
    const endAnchor = anchors.find((anchor) => anchor.x === link.endAnchor.x && anchor.y === link.endAnchor.y)
    // 判断是否连接的是同一个锚点，且锚点是否允许连接自身
    return !(startAnchor != null && startAnchor === endAnchor && startAnchor.disableLinkSelf)
  }

  // 判断起始连接节点，是否超过控件控件最大输出连线条数与锚点最大输出连线条数
  if (startNode && startControl) {
    /** 连接在 startNode 上的所有连线 */
    const links = data.links.filter((link) => link.startNodeId === startNode.id || link.endNodeId === startNode.id)
    /** 连接在 startNode 上的所有"输出"连线 */
    const startLinks = links.filter((l) => l.startNodeId === startNode.id && l.id !== link.id)
    if (startLinks.length + 1 > get(startControl.maxLinkOut, Infinity)) return false
    const anchors = startControl.anchors
    if (anchors) {
      /** 输出锚点 */
      const startAnchor = anchors.find((anchor) => anchor.x === link.startAnchor.x && anchor.y === link.startAnchor.y)
      /** 在输出锚点上的所有输出连线 */
      const startAnchorLinks = startLinks.filter((l) => l.startAnchor.x === link.startAnchor.x && l.startAnchor.y === link.startAnchor.y)
      if (startAnchor != null && startAnchorLinks.length > get(startAnchor.maxOut, Infinity)) return false
    }
  }

  // 判断终止连接节点，是否超过控件控件最大输入连线条数与锚点最大输入连线条数
  if (endNode && endControl) {
    /** 连接在 endNode 上的所有连线 */
    const links = data.links.filter((link) => link.startNodeId === endNode.id || link.endNodeId === endNode.id)
    /** 连接在 endNode 上的所有"输入"连线 */
    const endLinks = links.filter((l) => l.endNodeId === endNode.id && l.id !== link.id)
    if (endLinks.length + 1 > get(endControl.maxLinkIn, Infinity)) return false
    const anchors = endControl.anchors
    if (anchors) {
      /** 输入锚点 */
      const endAnchor = anchors.find((anchor) => anchor.x === link.endAnchor.x && anchor.y === link.endAnchor.y)
      /** 在输入锚点上的所有输入连线 */
      const endAnchorLinks = endLinks.filter((l) => l.endAnchor.x === link.endAnchor.x && l.endAnchor.y === link.endAnchor.y)
      if (endAnchor != null && endAnchorLinks.length > get(endAnchor.maxIn, Infinity)) return false
    }
  }

  // 最后默认为合法
  return true
}
