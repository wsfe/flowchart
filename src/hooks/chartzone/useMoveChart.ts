import { ICanvasCoordinate, ICanvasArea } from '../../interfaces'
import { FlowChartNode, FlowChartLink } from '../../store'
import { ifMouseInsideElement, getElementPosition } from '../../utils'
import FlowChartSet, { getSetArray } from '../../utils/set'
import { getAreaByCharts } from '../../utils/area'
import { useAttachLine } from './index'

interface IUseMoveChartParams {
  $refs: {
    canvas: HTMLDivElement,
  },
  isMovingChart: boolean,
  canvasScale: number,
  selectedChartSet: FlowChartSet<FlowChartNode | FlowChartLink>,
  moveSelectedCharts: (offset: ICanvasCoordinate) => void,
  $emit: Function,
}

/** 处理移动元素 */
export default function useMoveChart (context: IUseMoveChartParams, attachLineContext: ReturnType<typeof useAttachLine>) {
  let isReady = false

  /** 移动元素的起始坐标 */
  let moveStartPosition = {
    clientX: 0,
    clientY: 0,
  }

  const onBackgroundMouseMove = (event: MouseEvent) => {
    if (isReady && !context.isMovingChart) {
      context.isMovingChart = true
      attachLineContext.updateMovingNodePossibleLines()
    }
    if (context.isMovingChart) {
      const moveStartPositionCache = Object.assign({}, moveStartPosition)
      let moveEndPosition = {
        clientX: Math.trunc(event.clientX),
        clientY: Math.trunc(event.clientY),
      }
      if (!ifMouseInsideElement(event, context.$refs.canvas)) {
        const canvasPosition = getElementPosition(context.$refs.canvas)
        moveEndPosition.clientX = canvasPosition.left
        moveEndPosition.clientY = canvasPosition.top
      }
      const offset = {
        x: Math.trunc((moveEndPosition.clientX - moveStartPosition.clientX) / context.canvasScale),
        y: Math.trunc((moveEndPosition.clientY - moveStartPosition.clientY) / context.canvasScale),
      }
      moveStartPosition.clientX = moveEndPosition.clientX
      moveStartPosition.clientY = moveEndPosition.clientY
      const previousArea = getAreaByCharts(getSetArray(context.selectedChartSet))
      const nextArea: ICanvasArea = {
        ...previousArea,
        x: previousArea.x + offset.x,
        y: previousArea.y + offset.y,
      }
      // 检测是否该吸附
      const attachInfo = attachLineContext.shouldAttach(nextArea)
      if (attachInfo.attach) {
        offset.x += attachInfo.offset.x
        offset.y += attachInfo.offset.y
        moveStartPosition.clientX += attachInfo.offset.x * context.canvasScale
        moveStartPosition.clientY += attachInfo.offset.y * context.canvasScale
      }
      if (offset.x === 0) moveStartPosition.clientX = moveStartPositionCache.clientX
      if (offset.y === 0) moveStartPosition.clientY = moveStartPositionCache.clientY
      context.moveSelectedCharts(offset)
    }
  }

  const onBackgroundMouseUp = (event: MouseEvent) => {
    if (context.isMovingChart) {
      context.isMovingChart = false
      context.$emit('take-snapshot')
    }
    isReady = false
  }

  const onNodeMouseDown = (node: FlowChartNode, event: MouseEvent) => {
    isReady = true
    moveStartPosition.clientX = Math.trunc(event.clientX)
    moveStartPosition.clientY = Math.trunc(event.clientY)
  }

  const onLinkMouseDown = (link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => {
    if (!isPolyline && !link.startNodeId && !link.endNodeId) {
      isReady = true
      moveStartPosition.clientX = Math.trunc(event.clientX)
      moveStartPosition.clientY = Math.trunc(event.clientY)
    }
  }

  return {
    onBackgroundMouseMove,
    onBackgroundMouseUp,
    onNodeMouseDown,
    onLinkMouseDown,
  }
}
