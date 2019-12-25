import Vue from 'vue'
import { FlowChartData, FlowChartNode, FlowChartLink } from '../../store'
import { ICanvasArea, ICanvasCoordinate, ICanvasSize } from '../../interfaces'
import FlowChartSet from '../../utils/set'
import cloneDeep from 'lodash.clonedeep'

interface IUseAttachLineParams {
  flowChartData: FlowChartData,
  isCreatingNode: boolean,
  createNode: FlowChartNode,
  isMovingChart: boolean,
  selectedChartSet: FlowChartSet<FlowChartNode | FlowChartLink>,
  attachLine: {
    horizontal: number,
    vertical: number,
  },
  $watch: Vue['$watch'],
}

interface IShouldAttachFunctionReturnType {
  attach: boolean,
  offset: ICanvasCoordinate,
  isHorizontalCenterAttached: boolean,
  isVerticalCenterAttached: boolean,
}

const DEFAULT_POSSIBLE_LINES = {
  center: {
    horizontal: [] as number[],
    vertical: [] as number[],
  },
  edge: {
    horizontal: [] as number[],
    vertical: [] as number[],
  },
}

/** 吸附阈值，小于这个值则吸附 */
const attachThreshold = 3

/** 处理吸附直线 */
export default function useAttachLine (context: IUseAttachLineParams) {
  let possibleAttachLines = cloneDeep(DEFAULT_POSSIBLE_LINES)

  const updatePossibleLines = (movingIds: string[] = []) => {
    // 重置可能的吸附线数据
    possibleAttachLines = cloneDeep(DEFAULT_POSSIBLE_LINES)
    context.flowChartData.nodes.forEach((node) => {
      if (movingIds.indexOf(node.id) === -1) {
        // 一个节点有两条 center 线，四条 edge 线
        const center = node.center
        possibleAttachLines.center.horizontal.push(center.y)
        possibleAttachLines.center.vertical.push(center.x)

        possibleAttachLines.edge.horizontal.push(node.style.y)
        possibleAttachLines.edge.horizontal.push(node.style.y + node.style.height)
        possibleAttachLines.edge.vertical.push(node.style.x)
        possibleAttachLines.edge.vertical.push(node.style.x + node.style.width)
      }
    })
  }

  const updateCreatingNodePossibleLines = () => {
    updatePossibleLines()
  }

  const updateCreateNodeControlAndSize = (controlName: string, size: ICanvasSize) => {
    context.createNode.controlName = controlName
    Object.assign(context.createNode.style, size)
  }

  const updateCreateNodePosition = (position: ICanvasCoordinate) => {
    context.createNode.style.x = position.x
    context.createNode.style.y = position.y
  }

  const updateMovingNodePossibleLines = () => {
    const movingIds: string[] = []
    context.selectedChartSet.forEach((chart) => {
      if (chart instanceof FlowChartNode) {
        movingIds.push(chart.id)
      }
    })
    updatePossibleLines(movingIds)
  }

  const clearAttachLine = () => {
    context.attachLine.horizontal = NaN
    context.attachLine.vertical = NaN
  }

  const shouldAttach = (movingArea: ICanvasArea): IShouldAttachFunctionReturnType => {
    // 初始化 attachLine
    clearAttachLine()
    // 先判断中心再判断边缘
    // 先判断水平再判断垂直
    let horizontalFlag = false
    let verticalFlag = false
    let isHorizontalCenterAttached = false
    let isVerticalCenterAttached = false
    const offset = {
      x: 0,
      y: 0,
    }
    const movingCenter: ICanvasCoordinate = {
      x: Math.trunc(movingArea.x + movingArea.width / 2),
      y: Math.trunc(movingArea.y + movingArea.height / 2),
    }
    possibleAttachLines.center.horizontal.some((line) => {
      const diff = line - movingCenter.y
      if (Math.abs(diff) <= attachThreshold) {
        offset.y = diff
        horizontalFlag = true
        isHorizontalCenterAttached = true
        context.attachLine.horizontal = line
      }
      return horizontalFlag
    })
    possibleAttachLines.center.vertical.some((line) => {
      const diff = line - movingCenter.x
      if (Math.abs(diff) <= attachThreshold) {
        offset.x = diff
        verticalFlag = true
        isVerticalCenterAttached = true
        context.attachLine.vertical = line
      }
      return verticalFlag
    })

    if (!horizontalFlag) {
      const ys = [movingArea.y, movingArea.y + movingArea.height]
      possibleAttachLines.edge.horizontal.some((line) => {
        return ys.some((y) => {
          const diff = line - y
          if (Math.abs(diff) <= attachThreshold) {
            offset.y = diff
            horizontalFlag = true
            context.attachLine.horizontal = line
          }
          return horizontalFlag
        })
      })
    }

    if (!verticalFlag) {
      const xs = [movingArea.x, movingArea.x + movingArea.width]
      possibleAttachLines.edge.vertical.some((line) => {
        return xs.some((x) => {
          const diff = line - x
          if (Math.abs(diff) <= attachThreshold) {
            offset.x = diff
            verticalFlag = true
            context.attachLine.vertical = line
          }
          return verticalFlag
        })
      })
    }

    return {
      attach: horizontalFlag || verticalFlag,
      offset,
      isHorizontalCenterAttached,
      isVerticalCenterAttached,
    }
  }

  return {
    updateCreatingNodePossibleLines,
    updateCreateNodeControlAndSize,
    updateCreateNodePosition,
    updateMovingNodePossibleLines,
    clearAttachLine,
    shouldAttach,
  }
}
