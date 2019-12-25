import { FlowChartLink, FlowChartData, FlowChartNode } from '../../store'
import { ICanvasCoordinate, IControlAnchor } from '../../interfaces'
import { isLinkOperationValid } from '../../utils/link'

interface IUseMoveLinkAnchorParams {
  flowChartData: FlowChartData,
  allowFreeLink: boolean,
  isMovingLinkAnchor: boolean,
  moveLinkAnchor: FlowChartLink | null,
  getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate,
  $emit: Function,
}

/** 处理移动连线锚点 */
export default function useMoveLinkAnchor (context: IUseMoveLinkAnchorParams) {
  let isReady = false

  /** 移动连线的锚点，是起点还是终点 */
  let anchorType = 'start' as 'start' | 'end'

  const onBackgroundMouseMove = (event: MouseEvent) => {
    if (isReady) context.isMovingLinkAnchor = true
    if (context.isMovingLinkAnchor) {
      const link = context.moveLinkAnchor as FlowChartLink
      link[`${anchorType}NodeId` as 'startNodeId' | 'endNodeId'] = null
      link[`${anchorType}Coordinate` as 'startCoordinate' | 'endCoordinate'] = context.getMouseCoordinate(event)
    }
  }

  const onBackgroundMouseUp = (event: MouseEvent) => {
    if (context.isMovingLinkAnchor) {
      context.isMovingLinkAnchor = false
      if (context.moveLinkAnchor) {
        if (isLinkOperationValid(context.moveLinkAnchor, context.flowChartData) && (!context.allowFreeLink && !context.moveLinkAnchor.isLinkFree() || context.allowFreeLink)) {
          context.$emit('take-snapshot')
        } else {
          context.$emit('revert-snapshot')
        }
      }
    }
    isReady = false
  }

  const onNodeMouseMove = (node: FlowChartNode, event: MouseEvent, anchor: IControlAnchor) => {
    if (isReady) context.isMovingLinkAnchor = true
    if (context.isMovingLinkAnchor) {
      // 防止 background mousemove 再次处理
      event.stopPropagation()

      const link = context.moveLinkAnchor as FlowChartLink
      link[`${anchorType}NodeId` as 'startNodeId' | 'endNodeId'] = node.id
      link[`${anchorType}Anchor` as 'startAnchor' | 'endAnchor'] = anchor
    }
  }

  const onAnchorMouseMove = (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => {
    if (context.isMovingLinkAnchor) {
      const link = context.moveLinkAnchor as FlowChartLink
      link[`${anchorType}NodeId` as 'startNodeId' | 'endNodeId'] = node.id
      link[`${anchorType}Anchor` as 'startAnchor' | 'endAnchor'] = anchor
    }
  }

  const onAnchorMouseUp = (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => {
    if (context.isMovingLinkAnchor) {
      const link = context.moveLinkAnchor as FlowChartLink
      link[`${anchorType}NodeId` as 'startNodeId' | 'endNodeId'] = node.id
      link[`${anchorType}Anchor` as 'startAnchor' | 'endAnchor'] = anchor

      context.isMovingLinkAnchor = false
      if (context.moveLinkAnchor) {
        if (isLinkOperationValid(context.moveLinkAnchor, context.flowChartData) && (!context.allowFreeLink && !context.moveLinkAnchor.isLinkFree() || context.allowFreeLink)) {
          context.$emit('take-snapshot')
        } else {
          context.$emit('revert-snapshot')
        }
      }
    }
    isReady = false
  }

  const onLinkAnchorMouseDown = (link: FlowChartLink, event: MouseEvent, type: 'start' | 'end') => {
    isReady = true
    context.moveLinkAnchor = link
    anchorType = type
    context.moveLinkAnchor[`${anchorType}NodeId` as 'startNodeId' | 'endNodeId'] = null
    context.moveLinkAnchor[`${anchorType}Coordinate` as 'startCoordinate' | 'endCoordinate'] = context.getMouseCoordinate(event)
  }

  const onLinkStartAnchorMouseDown = (link: FlowChartLink, event: MouseEvent) => {
    onLinkAnchorMouseDown(link, event, 'start')
  }

  const onLinkEndAnchorMouseDown = (link: FlowChartLink, event: MouseEvent) => {
    onLinkAnchorMouseDown(link, event, 'end')
  }

  return {
    onBackgroundMouseMove,
    onBackgroundMouseUp,
    onNodeMouseMove,
    onAnchorMouseMove,
    onAnchorMouseUp,
    onLinkStartAnchorMouseDown,
    onLinkEndAnchorMouseDown,
  }
}
