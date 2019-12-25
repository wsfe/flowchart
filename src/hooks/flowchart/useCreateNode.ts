import { FlowChartNode } from '../../store'
import { ICanvasCoordinate, IFlowChartNode, ICanvasArea } from '../../interfaces'
import { DEFAULT_CONTROL_STYLE } from '../../const'
import { getMousePositionRelativeToElement, ifMouseInsideElement } from '../../utils'
import { useAttachLine } from '../chartzone'

interface IUseCreateNodeParams {
  $refs: {
    flowchart: HTMLDivElement,
    chartzone: {
      $refs: {
        background: HTMLDivElement,
        canvas: HTMLDivElement,
      },
      selectChart: Function,
    },
  },
  canvasScale: number,
  canvasPadding: number,
  isCreatingNode: boolean,
  isCreateNodeShow: boolean,
  createNode: FlowChartNode,
  isMouseInsideCanvas: boolean,
  addNode: (node: IFlowChartNode, takeSnapshot?: boolean) => FlowChartNode,
  $nextTick: Function,
}

/** 处理新建节点 */
export default function useCreateNode (context: IUseCreateNodeParams, attachLineContext: ReturnType<typeof useAttachLine>) {
  /** 创建节点实际坐标，跟随鼠标 */
  let createNodePosition: ICanvasCoordinate = {
    x: 0,
    y: 0,
  }

  /** 无视 scale 的标准坐标 */
  let canvasPosition = {
    x: 0,
    y: 0,
  }

  /** 更新创建节点 style */
  const updateCreateNodeStyle = () => {
    Object.assign(context.createNode.style, createNodePosition)
  }

  /** 更新创建节点位置 */
  const updateCreateNodePosition = (event: MouseEvent) => {
    let offset = {
      x: 0,
      y: 0,
    }
    /** 缩放对齐偏移量，防止新增节点时对齐抖动 */
    let scaledOffset = {
      x: 0,
      y: 0,
    }
    const mousePosition = getMousePositionRelativeToElement(event, context.$refs.flowchart)
    context.isMouseInsideCanvas = ifMouseInsideElement(event, context.$refs.chartzone.$refs.background)
    if (context.isMouseInsideCanvas) {
      const mouseCanvasPosition = getMousePositionRelativeToElement(event, context.$refs.chartzone.$refs.canvas)
      canvasPosition = {
        x: Math.trunc((mouseCanvasPosition.x - context.createNode.style.width * context.canvasScale / 2 - context.canvasPadding) / context.canvasScale),
        y: Math.trunc((mouseCanvasPosition.y - context.createNode.style.height * context.canvasScale / 2 - context.canvasPadding) / context.canvasScale),
      }
      const attachInfo = attachLineContext.shouldAttach({
        ...context.createNode.style,
        ...canvasPosition,
      })
      if (attachInfo.attach) {
        offset = attachInfo.offset
      }
      canvasPosition.x += offset.x
      canvasPosition.y += offset.y
      attachLineContext.updateCreateNodePosition(canvasPosition)

      // 更新缩放对齐偏移量
      scaledOffset.x = Math.trunc(mouseCanvasPosition.x / context.canvasScale) * context.canvasScale - mouseCanvasPosition.x
      scaledOffset.y = Math.trunc(mouseCanvasPosition.y / context.canvasScale) * context.canvasScale - mouseCanvasPosition.y
    }
    createNodePosition.x = Math.trunc(mousePosition.x - context.createNode.style.width * context.canvasScale / 2 + offset.x * context.canvasScale + scaledOffset.x)
    createNodePosition.y = Math.trunc(mousePosition.y - context.createNode.style.height * context.canvasScale / 2 + offset.y * context.canvasScale + scaledOffset.y)
    updateCreateNodeStyle()
  }

  const onDragZoneNodeMouseDown = (node: FlowChartNode, event: MouseEvent) => {
    context.isCreatingNode = true
    context.createNode.controlName = node.controlName
    // 更新宽高
    const defaultSize = {} as { width?: number, height?: number }
    context.createNode.control.defaultWidth != null && (defaultSize.width = context.createNode.control.defaultWidth)
    context.createNode.control.defaultHeight != null && (defaultSize.height = context.createNode.control.defaultHeight)
    const size = {
      width: DEFAULT_CONTROL_STYLE.width,
      height: DEFAULT_CONTROL_STYLE.height,
      ...defaultSize,
    }
    Object.assign(context.createNode.style, size)
    attachLineContext.updateCreateNodeControlAndSize(node.controlName, size)
    // 更新吸附节点数据
    attachLineContext.updateCreatingNodePossibleLines()
    attachLineContext.clearAttachLine()
    // 更新位置
    updateCreateNodePosition(event)
  }

  const onFlowChartMouseMove = (event: MouseEvent) => {
    if (context.isCreatingNode) {
      context.isCreateNodeShow = true
      updateCreateNodePosition(event)
    }
  }

  const onDocumentMouseUp = (event: MouseEvent) => {
    if (context.isCreatingNode) {
      const $background = context.$refs.chartzone.$refs.background
      if (ifMouseInsideElement(event, $background)) {
        // 只保留宽高 x y
        const createNodeStyle = {
          width: context.createNode.style.width,
          height: context.createNode.style.height,
          x: context.createNode.style.x,
          y: context.createNode.style.y,
        }
        const node = context.addNode({
          controlName: context.createNode.controlName,
          style: {
            ...createNodeStyle,
            x: canvasPosition.x,
            y: canvasPosition.y,
          },
          nodeData: {},
        })
        context.$nextTick(() => {
          context.$refs.chartzone.selectChart(node.id)
        })
      }
      context.isCreateNodeShow = false
      context.isCreatingNode = false
    }
  }

  return {
    onDragZoneNodeMouseDown,
    onFlowChartMouseMove,
    onDocumentMouseUp,
  }
}
