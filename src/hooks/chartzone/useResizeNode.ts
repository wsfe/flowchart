import { FlowChartNode, FlowChartLink } from '../../store'
import { ICanvasCoordinate, ICanvasArea } from '../../interfaces'
import FlowChartSet, { getSetArray } from '../../utils/set'
import { correctMouseCoordinate, getIntersection, getRotatedNodeCoordinate, getAnchorCoordinate } from '../../utils/node'
import { getAreaByCharts } from '../../utils/area'
import { getDistance } from '../../utils'
import { useAttachLine } from './index'

/** 缩放点坐标 key */
type ResizerAnchorKeyType = '00' | '10' | '01' | '11'

interface IUseResizeNodeParams {
  isResizingNode: boolean,
  selectedChartSet: FlowChartSet<FlowChartNode | FlowChartLink>,
  getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate,
  $emit: Function,
}

/** 处理缩放节点 */
export default function useResizeNode (context: IUseResizeNodeParams, attachLineContext: ReturnType<typeof useAttachLine>) {
  let isReady = false

  /** 固定点，缩放与旋转时固定的参考点 */
  let fixedPoint = {
    x: 0,
    y: 0,
  } as ICanvasCoordinate

  /** 缩放时移动中的点相对节点 0-1 位置记录 */
  let movingResizeAnchor = '00' as ResizerAnchorKeyType

  /** 固定点相对节点 0-1 位置记录 */
  let fixedResizeAnchor = '00' as ResizerAnchorKeyType

  /** 记录四个缩放点的坐标 */
  let resizerAnchorMap = {
    '00': { x: 0, y: 0 },
    '10': { x: 1, y: 0 },
    '01': { x: 0, y: 1 },
    '11': { x: 1, y: 1 },
  } as { [K in ResizerAnchorKeyType]: ICanvasCoordinate }

  const onBackgroundMouseMove = (event: MouseEvent) => {
    if (isReady && !context.isResizingNode) {
      context.isResizingNode = true
      attachLineContext.updateMovingNodePossibleLines()
    }
    const resizeNode = getSetArray(context.selectedChartSet)[0]
    if (context.isResizingNode && context.selectedChartSet.size === 1 && resizeNode instanceof FlowChartNode) {
      // TODO: 最小/最大尺寸限制

      // 首先获取四个缩放点相对画布的坐标
      let mouseCoordinate = context.getMouseCoordinate(event)

      // 处理缩放的最小尺寸，如果鼠标点坐标与节点边、限制尺寸所作的直线距离满足一定条件，则改变鼠标坐标以达到限制尺寸的目的
      const fixedAnchor = {
        x: Number(fixedResizeAnchor[0]),
        y: Number(fixedResizeAnchor[1]),
      }
      mouseCoordinate = correctMouseCoordinate(fixedPoint, fixedAnchor, mouseCoordinate, resizeNode.style.rotate)

      resizerAnchorMap[movingResizeAnchor] = mouseCoordinate
      resizerAnchorMap[`${fixedResizeAnchor[0]}${1 - Number(fixedResizeAnchor[1])}` as ResizerAnchorKeyType] = getIntersection(fixedPoint, mouseCoordinate, resizeNode.style.rotate)
      resizerAnchorMap[`${1 - Number(fixedResizeAnchor[0])}${fixedResizeAnchor[1]}` as ResizerAnchorKeyType] = getIntersection(mouseCoordinate, fixedPoint, resizeNode.style.rotate)
      // 然后计算节点新的宽高与 x, y
      const newCoordinate = getRotatedNodeCoordinate(Object.values(resizerAnchorMap))
      const newArea: ICanvasArea = {
        width: Math.trunc(getDistance(resizerAnchorMap['00'], resizerAnchorMap['10'])),
        height: Math.trunc(getDistance(resizerAnchorMap['00'], resizerAnchorMap['01'])),
        x: newCoordinate.x,
        y: newCoordinate.y,
      }
      let offset = {
        x: 0,
        y: 0,
      }
      // 判断吸附
      const attachInfo = attachLineContext.shouldAttach(newArea)
      if (attachInfo.attach) {
        offset = attachInfo.offset
        // 因为宽高增加 2 的时候，中线坐标只增加了 1 ，所以要判断是否中线对齐
        if (attachInfo.isHorizontalCenterAttached) {
          offset.y = attachInfo.offset.y * 2
        }
        if (attachInfo.isVerticalCenterAttached) {
          offset.x = attachInfo.offset.x * 2
        }
      }
      if (fixedResizeAnchor[0] === '1') {
        newArea.width -= offset.x
        newArea.x += offset.x
      } else {
        newArea.width += offset.x
      }
      if (fixedResizeAnchor[1] === '1') {
        newArea.height -= offset.y
        newArea.y += offset.y
      } else {
        newArea.height += offset.y
      }
      Object.assign(resizeNode.style, newArea)
    }
  }

  const onBackgroundMouseUp = (event: MouseEvent) => {
    if (context.isResizingNode) {
      context.isResizingNode = false
      context.$emit('take-snapshot')
    }
    isReady = false
  }

  const onResizerMouseDown = (event: MouseEvent, direction: ResizerAnchorKeyType) => {
    const resizerArea = getAreaByCharts(getSetArray(context.selectedChartSet))

    isReady = true
    // 取缩放点对角
    movingResizeAnchor = direction
    fixedResizeAnchor = `${1 - Number(direction[0])}${1 - Number(direction[1])}` as ResizerAnchorKeyType
    fixedPoint = getAnchorCoordinate(Object.assign({}, resizerArea, { rotate: 0 }), resizerArea, {
      x: Number(fixedResizeAnchor[0]),
      y: Number(fixedResizeAnchor[1]),
    })
    resizerAnchorMap[fixedResizeAnchor] = fixedPoint
  }

  return {
    onBackgroundMouseMove,
    onBackgroundMouseUp,
    onResizerMouseDown,
  }
}
