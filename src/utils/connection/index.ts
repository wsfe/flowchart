import { FlowChartNode, FlowChartLink, FlowChartData } from '../../store'
import { ICanvasCoordinate, IControlAnchor, IControlStyle } from '../../interfaces'
import { getRotatedCoordinate } from '../node'
import Vector from './vector'
import AStar from '../a-star'
import { getDistance } from '../index'

/** 连线节点外边距，正交连线从距离锚点 nodeMargin 距离开始算 */
const nodeMargin = 30

/** 两线段是否平行 */
const isSegmentsParallel = (segment1: ICanvasCoordinate[], segment2: ICanvasCoordinate[]): boolean => {
  const vector1 = new Vector(segment1[0].x - segment1[1].x, segment1[0].y - segment1[1].y)
  const vector2 = new Vector(segment2[0].x - segment2[1].x, segment2[0].y - segment2[1].y)
  return vector1.isParallel(vector2)
}

/** 快速排斥实验，如未通过，则两条线段不相交，否则可能相交，需要叉乘继续判断 */
const exclusionTest = (segment1: ICanvasCoordinate[], segment2: ICanvasCoordinate[]): boolean => {
  return (
    Math.min(segment1[0].x, segment1[1].x) <= Math.max(segment2[0].x, segment2[1].x) &&
    Math.min(segment2[0].x, segment2[1].x) <= Math.max(segment1[0].x, segment1[1].x) &&
    Math.min(segment1[0].y, segment1[1].y) <= Math.max(segment2[0].y, segment2[1].y) &&
    Math.min(segment2[0].y, segment2[1].y) <= Math.max(segment1[0].y, segment1[1].y)
  )
}

/** 获取判定相交叉积结果 */
const getCrossResult = (segment1: ICanvasCoordinate[], segment2: ICanvasCoordinate[]): number => {
  const mainVector = new Vector(segment1[1].x - segment1[0].x, segment1[1].y - segment1[0].y)
  const pointVector1 = new Vector(segment2[0].x - segment1[0].x, segment2[0].y - segment1[0].y)
  const pointVector2 = new Vector(segment2[1].x - segment1[0].x, segment2[1].y - segment1[0].y)
  return mainVector.cross(pointVector1) * mainVector.cross(pointVector2)
}

/** 判断两条线段是否相交 */
const isSegmentsIntersect = (segment1: ICanvasCoordinate[], segment2: ICanvasCoordinate[], includeBorder: boolean = true): boolean => {
  if (includeBorder) {
    return exclusionTest(segment1, segment2) && getCrossResult(segment1, segment2) <= 0 && getCrossResult(segment2, segment1) <= 0
  } else {
    return exclusionTest(segment1, segment2) && getCrossResult(segment1, segment2) < 0 && getCrossResult(segment2, segment1) < 0
  }
}

/** 判断线段与矩形是否相交 */
const isSegmentRectIntersect = (segment: ICanvasCoordinate[], rectSegments: ICanvasCoordinate[][], includeBorder: boolean = true): boolean => {
  return rectSegments.some((rectSegment) => isSegmentsIntersect(segment, rectSegment, includeBorder))
}

/** 获取节点根据 nodeMargin 扩展后的四个角坐标 */
const getCornerPoints = (node: FlowChartNode, margin: number = nodeMargin): ICanvasCoordinate[] => {
  const { x, y, width, height, rotate } = node.style
  const center: ICanvasCoordinate = {
    x: x + width / 2,
    y: y + height / 2,
  }
  return [
    // 左上
    getRotatedCoordinate({ x: x - margin, y: y - margin }, center, rotate),
    // 左下
    getRotatedCoordinate({ x: x - margin, y: y + height + margin }, center, rotate),
    // 右上
    getRotatedCoordinate({ x: x + width + margin, y: y - margin }, center, rotate),
    // 右下
    getRotatedCoordinate({ x: x + width + margin, y: y + height + margin }, center, rotate),
  ]
}

/** 根据节点四个角坐标获取四条线段，与 getCornerPoints 返回的点顺序有关 */
const getNodeSegments = (cornerPoints: ICanvasCoordinate[]): ICanvasCoordinate[][] => {
  return [
    // 左侧（左上-左下）
    [ cornerPoints[0], cornerPoints[1] ],
    // 上侧（左上-右上）
    [ cornerPoints[0], cornerPoints[2] ],
    // 右侧（右上-右下）
    [ cornerPoints[2], cornerPoints[3] ],
    // 下侧（左下-右下）
    [ cornerPoints[1], cornerPoints[3] ],
  ]
}

/** 点是否在节点外 */
const isPointOutsideNode = (point: ICanvasCoordinate, node: FlowChartNode, includeBorder: boolean = true): boolean => {
  const { x, y, width, height } = node.style
  if (includeBorder) {
    return point.x <= x || point.x >= x + width || point.y <= y || point.y >= y + height
  } else {
    return point.x < x || point.x > x + width || point.y < y || point.y > y + height
  }
}

/** 线段是否与矩形的某一条边有重合 */
const isSegmentRectCoincide = (segment: ICanvasCoordinate[], rectSegments: ICanvasCoordinate[][]): boolean => {
  // TODO：这里可能因为锚点在角落而出问题
  return rectSegments.some((rectSegment) => {
    return isSegmentsParallel(segment, rectSegment) && isSegmentsIntersect(segment, rectSegment)
  })
}

/** 获取点作横竖直线与终点作横竖直线的交点 */
const getEndCoordinateIntersections = (endCoordinate: ICanvasCoordinate, endNode: FlowChartNode | null, endAnchor: ICanvasCoordinate | null, c: ICanvasCoordinate): ICanvasCoordinate[] => {
  /** 终点水平向量 */
  const horizontalVector = new Vector(1, 0)
  /** 终点竖直向量 */
  const verticalVector = new Vector(0, 1)
  if (endNode && endAnchor) {
    const edgeCoordinates: ICanvasCoordinate[] = []
    if (endAnchor.y === 0) {
      edgeCoordinates.push(...[
        endNode.getAnchorCoordinate({ x: 0, y: 0 }),
        endNode.getAnchorCoordinate({ x: 1, y: 0 }),
      ])
    } else if (endAnchor.x === 1) {
      edgeCoordinates.push(...[
        endNode.getAnchorCoordinate({ x: 1, y: 0 }),
        endNode.getAnchorCoordinate({ x: 1, y: 1 }),
      ])
    } else if (endAnchor.y === 1) {
      edgeCoordinates.push(...[
        endNode.getAnchorCoordinate({ x: 0, y: 1 }),
        endNode.getAnchorCoordinate({ x: 1, y: 1 }),
      ])
    } else { // endAnchor.x === 0
      edgeCoordinates.push(...[
        endNode.getAnchorCoordinate({ x: 0, y: 0 }),
        endNode.getAnchorCoordinate({ x: 0, y: 1 }),
      ])
    }
    const anchorVector1 = new Vector(edgeCoordinates[0].x - endCoordinate.x, edgeCoordinates[0].y - endCoordinate.y)
    const anchorVector2 = new Vector(edgeCoordinates[1].x - endCoordinate.x, edgeCoordinates[1].y - endCoordinate.y)
    const horizontalCosine1 = horizontalVector.dot(anchorVector1) / (horizontalVector.length * anchorVector1.length)
    const horizontalCosine2 = horizontalVector.dot(anchorVector2) / (horizontalVector.length * anchorVector2.length)
    const horizontalAbsoluteCosineDiff = Math.abs(horizontalCosine1 - horizontalCosine2)
    const verticalCosine1 = verticalVector.dot(anchorVector1) / (verticalVector.length * anchorVector1.length)
    const verticalCosine2 = verticalVector.dot(anchorVector2) / (verticalVector.length * anchorVector2.length)
    const verticalAbsoluteCosineDiff = Math.abs(verticalCosine1 - verticalCosine2)
    let intersection: ICanvasCoordinate
    if (horizontalAbsoluteCosineDiff <= verticalAbsoluteCosineDiff) {
      // 水平直线交点
      intersection = { x: c.x, y: endCoordinate.y }
    } else {
      // 竖直直线交点
      intersection = { x: endCoordinate.x, y: c.y }
    }
    if (intersection.x === c.x && intersection.y === c.y) {
      // 如果交点是当前点，则当前点与终点共线，则交点取终点即可
      intersection = endCoordinate
    }
    return [intersection]
  } else {
    return [
      { x: endCoordinate.x, y: c.y },
      { x: c.x, y: endCoordinate.y },
    ]
  }
}

/** 获取正交折线拐点 */
const getOrthogonalPoints = (
  startCoordinate: ICanvasCoordinate,
  endCoordinate: ICanvasCoordinate,
  startNode: FlowChartNode | null = null,
  endNode: FlowChartNode | null = null,
  endAnchor: ICanvasCoordinate | null = null,
): ICanvasCoordinate[] => {
  const nodes: FlowChartNode[] = [startNode, endNode].filter((node) => node instanceof FlowChartNode) as FlowChartNode[]
  const cornerPoints: ICanvasCoordinate[] = []
  const rectSegments: ICanvasCoordinate[][][] = []
  let startRectSegment: ICanvasCoordinate[][] | null = null
  let endRectSegment: ICanvasCoordinate[][] | null = null
  if (startNode) {
    cornerPoints.push(...getCornerPoints(startNode))
    startRectSegment = getNodeSegments(getCornerPoints(startNode, 0))
    rectSegments.push(startRectSegment)
  }
  if (endNode) {
    cornerPoints.push(...getCornerPoints(endNode))
    endRectSegment = getNodeSegments(getCornerPoints(endNode, 0))
    rectSegments.push(endRectSegment)
  }
  // 找起点与终点的中点
  const middlePoints: ICanvasCoordinate[] = []
  if (startCoordinate.x !== endCoordinate.x && startCoordinate.y !== endCoordinate.y) {
    middlePoints.push(...[
      { x: startCoordinate.x, y: Math.min(startCoordinate.y, endCoordinate.y) + Math.trunc(Math.abs(startCoordinate.y - endCoordinate.y) / 2) },
      { x: Math.min(startCoordinate.x, endCoordinate.x) + Math.trunc(Math.abs(startCoordinate.x - endCoordinate.x) / 2), y: startCoordinate.y },
    ])
  }
  const getWalkableNodes = (c: ICanvasCoordinate): ICanvasCoordinate[] => {
    let result: ICanvasCoordinate[] = []
    const intersectPoints = [...cornerPoints, ...middlePoints]
    // 此处获取当前点作横竖直线与 intersectPoints 中所有点作横竖直线的交点
    const intersections = intersectPoints.reduce((sum: ICanvasCoordinate[], current: ICanvasCoordinate): ICanvasCoordinate[] => {
      return sum.concat([
        { x: current.x, y: c.y },
        { x: c.x, y: current.y },
      ])
    }, [])
    // 加入与终点的交点，如果终点在节点上，则只要取与进入节点方向直线的交点就可以
    intersections.push(...getEndCoordinateIntersections(endCoordinate, endNode, endAnchor, c))
    // 去重
    result = [...new Set(intersections.map((r) => `${r.x},${r.y}`))].map((r) => {
      const array = r.split(',')
      return {
        x: Number(array[0]),
        y: Number(array[1]),
      }
    })
    // 过滤交点，把与当前点 c 连接会产生冲突的交点都过滤掉
    result = result.filter((r: ICanvasCoordinate) => {
      const segment = [c, r]
      if (r.x === endCoordinate.x && r.y === endCoordinate.y) {
        return (
          nodes.every((node) => isPointOutsideNode(c, node, false)) &&
          !rectSegments.some((rectSegment) => isSegmentRectIntersect(segment, rectSegment, false)) &&
          (!endRectSegment || !isSegmentRectCoincide(segment, endRectSegment))
        )
      }
      if (c.x === startCoordinate.x && c.y === startCoordinate.y) {
        return (
          nodes.every((node) => isPointOutsideNode(r, node)) &&
          !rectSegments.some((rectSegment) => isSegmentRectIntersect(segment, rectSegment, false)) &&
          (!startRectSegment || !isSegmentRectCoincide(segment, startRectSegment))
        )
      }
      // 过滤出不与两个节点相交的线段
      return !rectSegments.some((rectSegment) => isSegmentRectIntersect(segment, rectSegment))
    })
    return result
  }
  return AStar(startCoordinate, endCoordinate, getWalkableNodes, getDistance) || []
}

/** 获取连线点坐标 */
const getConnectionPoints = (link: FlowChartLink, flowChartData: FlowChartData): ICanvasCoordinate[] => {
  const startNode: FlowChartNode | null = link.startNodeId ? flowChartData.findChartById(link.startNodeId) as FlowChartNode : null
  const endNode: FlowChartNode | null = link.endNodeId ? flowChartData.findChartById(link.endNodeId) as FlowChartNode : null
  if (startNode !== null || endNode !== null) {
    // 有连接节点的情况
    /** 正交折线起点 */
    const startCoordinate = startNode ? startNode.getAnchorCoordinate(link.startAnchor) : link.startCoordinate
    /** 正交折线终点 */
    const endCoordinate = endNode ? endNode.getAnchorCoordinate(link.endAnchor) : link.endCoordinate
    let orthogonalPoints = getOrthogonalPoints(startCoordinate, endCoordinate, startNode, endNode, link.endAnchor)
    if (!orthogonalPoints.length) orthogonalPoints = getOrthogonalPoints(startCoordinate, endCoordinate)
    return orthogonalPoints
  } else {
    // 真·自由连线
    return getOrthogonalPoints(link.startCoordinate, link.endCoordinate)
  }
}

export {
  getConnectionPoints,
}
