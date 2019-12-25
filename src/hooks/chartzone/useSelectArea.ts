import { FlowChartNode, FlowChartLink, FlowChartData } from '../../store'
import { ICanvasCoordinate } from '../../interfaces'
import FlowChartSet from '../../utils/set'
import { getArea, getChartsInsideArea } from '../../utils/area'

interface IUseSelectAreaParams {
  $refs: {
    canvas: HTMLDivElement,
    background: HTMLDivElement,
  },
  flowChartData: FlowChartData,
  isSelectingArea: boolean,
  selectedChartSet: FlowChartSet<FlowChartNode | FlowChartLink>,
  selectingAreaStart: ICanvasCoordinate,
  selectingAreaEnd: ICanvasCoordinate,
  getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate,
  $emit: Function,
}

/** 处理选择区域 */
export default function useSelectArea (context: IUseSelectAreaParams) {
  let isReady = false

  const onBackgroundMouseDown = (event: MouseEvent) => {
    if (event.target === context.$refs.canvas || event.target === context.$refs.background) {
      context.selectedChartSet.clear()
      isReady = true

      context.selectingAreaStart = context.getMouseCoordinate(event)
    }
  }

  const onBackgroundMouseMove = (event: MouseEvent) => {
    if (isReady) context.isSelectingArea = true
    if (context.isSelectingArea) {
      context.selectingAreaEnd = context.getMouseCoordinate(event)
    }
  }

  const onBackgroundMouseUp = (event: MouseEvent) => {
    if (context.isSelectingArea) {
      const area = getArea([context.selectingAreaStart, context.selectingAreaEnd])
      const charts = getChartsInsideArea(area, context.flowChartData)
      charts.forEach((chart) => {
        context.selectedChartSet.add(chart)
      })
      context.isSelectingArea = false
    }
    isReady = false
  }

  const onNodeMouseDown = (node: FlowChartNode, event: MouseEvent) => {
    if (!context.selectedChartSet.has(node)) {
      context.selectedChartSet.clear()
      context.selectedChartSet.add(node)
    }
  }

  const onNodeCtrlMouseDown = (node: FlowChartNode, event: MouseEvent) => {
    context.selectedChartSet.add(node)
  }

  const onLinkMouseDown = (link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => {
    if (!context.selectedChartSet.has(link)) {
      context.selectedChartSet.clear()
      context.selectedChartSet.add(link)
    }
  }

  const onLinkCtrlMouseDown = (link: FlowChartLink, event: MouseEvent) => {
    context.selectedChartSet.add(link)
  }

  return {
    onBackgroundMouseDown,
    onBackgroundMouseMove,
    onBackgroundMouseUp,
    onNodeMouseDown,
    onNodeCtrlMouseDown,
    onLinkMouseDown,
    onLinkCtrlMouseDown,
  }
}
