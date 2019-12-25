import { ICanvasArea, ICanvasCoordinate } from '../interfaces'
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store'
import { linkTypeEnum } from '../const'
import { getRotatedCoordinate } from './node'

/**
 * 根据点坐标获取区域
 * @param points 点
 */
export const getArea = (points: ICanvasCoordinate[]): ICanvasArea => {
  const minX = Math.min(...points.map((p) => p.x))
  const minY = Math.min(...points.map((p) => p.y))
  const maxX = Math.max(...points.map((p) => p.x))
  const maxY = Math.max(...points.map((p) => p.y))
  return {
    width: maxX - minX,
    height: maxY - minY,
    x: minX,
    y: minY,
  }
}

/**
 * 根据元素获取元素所组成的区域
 * @param charts 元素
 * @param nodes 所有节点
 */
export const getAreaByCharts = (charts: Array<FlowChartLink | FlowChartNode>): ICanvasArea => {
  const points: ICanvasCoordinate[] = []
  charts.forEach((chart) => {
    if (chart instanceof FlowChartNode) {
      // 获取节点旋转后的坐标
      const { x, y, width, height, rotate } = chart.style
      points.push(getRotatedCoordinate({ x, y }, chart.center, rotate))
      points.push(getRotatedCoordinate({ x: x + width, y }, chart.center, rotate))
      points.push(getRotatedCoordinate({ x, y: y + height }, chart.center, rotate))
      points.push(getRotatedCoordinate({ x: x + width, y: y + height }, chart.center, rotate))
    } else {
      if (chart.linkType === linkTypeEnum.polyline) {
        points.push(...chart.polylinePoints)
      } else {
        points.push(chart.startCoordinate_)
        points.push(chart.endCoordinate_)
      }
    }
  })
  return getArea(points)
}

/**
 * 判断区域 area1 是否在区域 area2 内
 * @param area1 区域1，被包含区域
 * @param area2 区域2，更大范围的区域
 */
export const isInsideArea = (area1: ICanvasArea, area2: ICanvasArea): boolean => {
  return (
    area1.x >= area2.x &&
    area1.x + area1.width <= area2.x + area2.width &&
    area1.y >= area2.y &&
    area1.y + area1.height <= area2.y + area2.height
  )
}

/**
 * 判断节点是否在一个区域内
 * @param node 节点
 * @param area 区域，包含 width, height, x, y 信息
 */
export const isNodeInsideArea = (node: FlowChartNode, area: ICanvasArea): boolean => {
  return isInsideArea(node.style, area)
}

/**
 * 判断连线是否在一个区域内
 * @param link 连线
 * @param area 区域，包含 width, height, x, y 信息
 * @param nodes 所有节点
 */
export const isLinkInsideArea = (link: FlowChartLink, area: ICanvasArea): boolean => {
  let linkArea: ICanvasArea
  if (link.linkType === linkTypeEnum.polyline) {
    linkArea = getArea(link.polylinePoints)
  } else {
    linkArea = getArea([link.startCoordinate_, link.endCoordinate_])
  }
  return isInsideArea(linkArea, area)
}

/**
 * 获取区域范围内的节点与连线
 * @param area 区域
 * @param flowChartData 元素数据
 */
export const getChartsInsideArea = (area: ICanvasArea, flowChartData: FlowChartData): Array<FlowChartNode | FlowChartLink> => {
  const result: Array<FlowChartNode | FlowChartLink> = []
  flowChartData.nodes.forEach((node) => {
    if (isNodeInsideArea(node, area)) {
      result.push(node)
    }
  })
  flowChartData.links.forEach((link) => {
    if (isLinkInsideArea(link, area)) {
      result.push(link)
    }
  })
  return result
}
