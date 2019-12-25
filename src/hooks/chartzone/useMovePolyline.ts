import { FlowChartLink } from '../../store'
import { ICanvasCoordinate } from '../../interfaces'

interface IUseMovePolylineParams {
  getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate,
  $emit: Function,
}

/** 处理移动折线 */
export default function useMovePolyline (context: IUseMovePolylineParams) {
  let isReady = false
  let isMovingPolyline = false
  let movePolylineLink: FlowChartLink | null = null
  let movePolylineIndex = 0

  const onBackgroundMouseMove = (event: MouseEvent) => {
    if (isReady) isMovingPolyline = true
    if (isMovingPolyline) {
      const link = movePolylineLink as FlowChartLink
      const direction = link.getPolylineDirectionByIndex(movePolylineIndex)
      const mouseCoordinate = context.getMouseCoordinate(event)
      if (direction === 'x') {
        link.setPolylinePosition(movePolylineIndex, mouseCoordinate.y)
      } else if (direction === 'y') {
        link.setPolylinePosition(movePolylineIndex, mouseCoordinate.x)
      }
    }
  }

  const onBackgroundMouseUp = (event: MouseEvent) => {
    if (isMovingPolyline) {
      isMovingPolyline = false
      context.$emit('take-snapshot')
    }
    isReady = false
  }

  const onLinkMouseDown = (link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => {
    if (isPolyline) {
      isReady = true
      movePolylineLink = link
      movePolylineIndex = polylineIndex
    }
  }

  return {
    onBackgroundMouseMove,
    onBackgroundMouseUp,
    onLinkMouseDown,
  }
}
