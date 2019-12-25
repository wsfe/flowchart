import { FlowChartLink, FlowChartNode } from '../../store'
import { ICanvasCoordinate, IControlAnchor } from '../../interfaces'

interface IUseCreateLinkParams {
  isCreatingLink: boolean,
  createLink: FlowChartLink,
  createNewLink: () => void,
  getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate,
  $emit: Function,
}

/** 处理创建连线 */
export default function useCreateLink (context: IUseCreateLinkParams) {
  let isReady = false

  const onBackgroundMouseMove = (event: MouseEvent) => {
    if (isReady) context.isCreatingLink = true
    if (context.isCreatingLink) {
      context.createLink.endNodeId = null
      context.createLink.endCoordinate = context.getMouseCoordinate(event)
    }
  }

  const onBackgroundMouseUp = (event: MouseEvent) => {
    if (context.isCreatingLink) {
      context.createLink.endCoordinate = context.getMouseCoordinate(event)
      context.createNewLink()
      context.isCreatingLink = false
    }
    isReady = false
  }

  const onNodeMouseMove = (node: FlowChartNode, event: MouseEvent, anchor: IControlAnchor) => {
    if (isReady) context.isCreatingLink = true
    if (context.isCreatingLink) {
      // 防止 background mousemove 再次处理
      event.stopPropagation()

      context.createLink.endNodeId = node.id
      context.createLink.endAnchor = anchor
    }
  }

  const onAnchorMouseDown = (node: FlowChartNode, anchor: IControlAnchor) => {
    isReady = true
    context.createLink.startNodeId = node.id
    context.createLink.startAnchor = anchor
  }

  const onAnchorMouseMove = (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => {
    if (context.isCreatingLink) {
      context.createLink.endNodeId = node.id
      context.createLink.endAnchor = anchor
    }
  }

  const onAnchorMouseUp = (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => {
    if (context.isCreatingLink) {
      context.createLink.endNodeId = node.id
      context.createLink.endAnchor = anchor
      context.createNewLink()
      context.isCreatingLink = false
    }
    isReady = false
  }

  return {
    onBackgroundMouseMove,
    onBackgroundMouseUp,
    onNodeMouseMove,
    onAnchorMouseDown,
    onAnchorMouseMove,
    onAnchorMouseUp,
  }
}
