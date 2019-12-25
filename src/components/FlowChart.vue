<template>
  <div
    ref="flowchart"
    :class="prefixCls"
    tabindex="0"
    @mousemove="handleFlowChartMouseMove"
    @keydown="handleFlowChartKeyDown"
    @keydown.delete="handleDeleteCharts"
    @keydown.ctrl.exact="handleCtrlKeyDown"
  >
    <DragZone
      v-if="!readonly"
      :controlList="processedControlList"
      @node-mousedown="handleDragZoneNodeMouseDown"
    />
    <ChartZone
      ref="chartzone"
      :flowChartData="flowChartData"
      :isCreatingNode="isCreatingNode"
      :flowChartCreateNode="createNode"
      :isMouseInsideCanvas="isMouseInsideCanvas"
      :canvasSize="processedCanvasSize"
      v-bind="$props"
      v-on="$listeners"
      @add-link="addLink"
      @take-snapshot="takeSnapshot"
      @replace-snapshot="replaceSnapshot"
      @revert-snapshot="revert"
    >
      <slot
        name="top-bar"
        slot="top-bar"
      ></slot>
      <slot
        name="bottom-bar"
        slot="bottom-bar"
      ></slot>
    </ChartZone>
    <Node
      v-if="isCreatingNode && isCreateNodeShow"
      :class="`${prefixCls}__creating-node`"
      :style="{
        zIndex: flowChartData.getMaxZ() + 1,
        transform: `scale(${canvasScale})`,
      }"
      :flowChartData="{}"
      :node="createNode"
      :readonly="true"
      :isThumbnail="true"
    />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import DragZone from './DragZone.vue'
import ChartZone from './ChartZone.vue'
import Node from './Node.vue'
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store'
import { CLASS_PREFIX, DEFAULT_CONTROL_CONFIG, DEFAULT_CONTROL_STYLE, linkTypeEnum, DEFAULT_ANCHORS, DEFAULT_CANVAS_SIZE, arrowKeyEnum } from '../const'
import { IControl, IControlStyle, IFlowChartNode, IFlowChartData, ICanvasSize, IFlowChartLink, IControlMap } from '../interfaces'
import { getAreaByCharts } from '../utils/area'
import { getSetArray } from '../utils/set'
import { useCreateNode } from '../hooks/flowchart'
import { useAttachLine } from '../hooks/chartzone'
import cloneDeep from 'lodash.clonedeep'

const prefixCls = CLASS_PREFIX

const getProcessedControlList = (list: IControl[]): IControl[] => {
  return list.map((control) => Object.assign({}, DEFAULT_CONTROL_CONFIG, control))
}

const getControlMap = (processedList: IControl[]) => {
  const result: IControlMap = {}
  processedList.forEach((control) => {
    result[control.controlName] = control
  })
  return result
}

interface IHookReturnValue {
  onDragZoneNodeMouseDown?: (node: FlowChartNode, event: MouseEvent) => void,
  onFlowChartMouseMove?: (event: MouseEvent) => void,
  onDocumentMouseUp?: (event: MouseEvent) => void,
}

type RequiredHookReturnValue = Required<IHookReturnValue>

export default (Vue as VueConstructor<Vue & {
  $refs: {
    flowchart: HTMLDivElement,
    chartzone: InstanceType<typeof ChartZone>,
  },
}>).extend({
  name: 'FlowChart',
  components: {
    DragZone,
    ChartZone,
    Node,
  },
  props: {
    /** 流程图数据 */
    data: {
      type: Object as () => IFlowChartData,
      default: () => ({
        nodes: [],
        links: [],
      }),
    },

    /** 拖拽区域的控件列表 */
    controlList: {
      type: Array as () => IControl[],
      default: () => [],
    },

    /** 连线类型 */
    linkType: {
      type: String as () => linkTypeEnum,
      default: linkTypeEnum.straight,
    },

    /** 连线编辑组件 */
    linkEditor: Object as () => VueConstructor,

    /** 连线编辑区域宽 */
    linkEditorWidth: {
      type: Number,
      default: 170,
    },

    /** 连线编辑区域高 */
    linkEditorHeight: {
      type: Number,
      default: 70,
    },

    /** 是否允许自由连线 */
    allowFreeLink: {
      type: Boolean,
      default: true,
    },

    /** 最大快照数 */
    maxSnapshots: {
      type: Number,
      default: 10,
    },

    /** 是否只读 */
    readonly: Boolean,

    /** 给每个元素上附加的 class */
    chartClassNameMethod: {
      type: Function as unknown as () => (chart: FlowChartNode | FlowChartLink) => object | Array<object | string> | string,
      default: () => () => ({}),
    },

    /** 判断元素是否可被删除  */
    isChartDeletable: {
      type: Function as unknown as () => (chart: FlowChartNode | FlowChartLink) => boolean,
      default: () => () => true,
    },

    /** 判断元素是否可编辑 */
    isChartEditable: {
      type: Function as unknown as () => (chart: FlowChartNode | FlowChartLink) => boolean,
      default: () => () => true,
    },

    /** 画布缩放大小 */
    canvasScale: {
      type: Number,
      default: 1,
      validator (value) {
        return value > 0
      },
    },

    /** 画布尺寸 */
    canvasSize: {
      type: Object as () => ICanvasSize,
      default: () => Object.assign({}, DEFAULT_CANVAS_SIZE),
    },

    /** 画布内边距 */
    canvasPadding: {
      type: Number,
      default: 1000,
    },

    /** 连线末尾箭头长度 */
    linkArrowWidth: {
      type: Number,
      default: 11,
    },

    /** 连线末尾箭头高度 */
    linkArrowHeight: {
      type: Number,
      default: 10,
    },

    /** 每一个元素都会接收到的，从外部传入的 props ，类型为任意 */
    provideChartProps: {},
  },
  data () {
    const initialFlowChartData = new FlowChartData(this.data, getControlMap(getProcessedControlList(this.controlList)))

    return {
      prefixCls,

      /** flowchart 组件库内部的流程图数据拷贝 */
      flowChartData: initialFlowChartData,

      /** 处理过的画布尺寸 */
      processedCanvasSize: Object.assign({}, this.canvasSize),

      /** 快照， snapshot[0] 为当前状态 */
      snapshots: [cloneDeep(initialFlowChartData)] as FlowChartData[],

      /** 重做栈 */
      redoStack: [] as FlowChartData[],

      /** 是否正在创建节点 */
      isCreatingNode: false,

      /** 是否显示创建节点 */
      isCreateNodeShow: false,

      createNode: new FlowChartNode({
        controlName: '',
        style: {},
      }),

      isMouseInsideCanvas: false,

      eventHandlers: {
        onDragZoneNodeMouseDown: [] as Array<RequiredHookReturnValue['onDragZoneNodeMouseDown']>,
        onFlowChartMouseMove: [] as Array<RequiredHookReturnValue['onFlowChartMouseMove']>,
        onDocumentMouseUp: [] as Array<RequiredHookReturnValue['onDocumentMouseUp']>,
      },
    }
  },
  computed: {
    processedControlList (): IControl[] {
      return getProcessedControlList(this.controlList)
    },

    controlMap (): IControlMap {
      return getControlMap(this.processedControlList)
    },
  },
  methods: {
    /** 外部 API ，获取实时的流程图数据 */
    getFlowChart () {
      return this.flowChartData
    },

    /** 外部 API， 获取选中的元素 */
    getSelectedCharts () {
      return getSetArray(this.$refs.chartzone.selectedChartSet)
    },

    /** 外部 API ，清除选中的元素 */
    clearSelectedCharts () {
      this.$refs.chartzone.selectedChartSet.clear()
    },

    /** 外部 API， 获取起始元素 */
    getStartCharts () {
      return this.flowChartData.getStartCharts()
    },

    /** 外部 API， 添加节点 */
    addNode (node: IFlowChartNode, takeSnapshot: boolean = true) {
      const newNode = this.flowChartData.addNode(node)
      if (takeSnapshot) {
        this.takeSnapshot()
      }
      return newNode
    },

    /** 外部 API， 添加连线 */
    addLink (link: IFlowChartLink, takeSnapshot: boolean = true) {
      const newLink = this.flowChartData.addLink(link)
      if (takeSnapshot) {
        this.takeSnapshot()
      }
      return newLink
    },

    /** 外部 API， 删除节点与连线 */
    deleteCharts (ids: string[], takeSnapshot: boolean = true) {
      ids.forEach((id) => {
        this.$refs.chartzone.unselectChart(id)
      })
      if (this.flowChartData.deleteCharts(ids, this.isChartDeletable).length) {
        this.$emit('chart-delete', ids)
        if (takeSnapshot) {
          this.takeSnapshot()
        }
      }
    },

    /** 外部 API， 删除单个节点或连线 */
    deleteChart (id: string, takeSnapshot: boolean = true) {
      this.$refs.chartzone.unselectChart(id)
      if (this.flowChartData.deleteChart(id, this.isChartDeletable)) {
        this.$emit('chart-delete', [id])
        if (takeSnapshot) {
          this.takeSnapshot()
        }
      }
    },

    /** 外部 API， 设置元素数据 */
    setChartData (id: string, valueObj: { [key: string]: any }, takeSnapshot: boolean = true) {
      if (this.flowChartData.setChartData(id, valueObj)) {
        if (takeSnapshot) {
          this.takeSnapshot()
        }
      }
    },

    /** 外部 API， 删除元素数据 */
    deleteChartData (id: string, keys: string[], takeSnapshot: boolean = true) {
      if (this.flowChartData.deleteChartData(id, keys)) {
        if (takeSnapshot) {
          this.takeSnapshot()
        }
      }
    },

    /** 根据节点与连线坐标更新画布大小 */
    updateProcessedCanvasSize () {
      const charts = this.flowChartData.getCharts()
      if (!charts.length) return
      let canvasArea = getAreaByCharts(charts)

      // 首先判断 x, y 是否为负，是则扩展画布后整体往右下移动
      const offset = { x: 0, y: 0 }
      if (canvasArea.x < 0) {
        offset.x = Math.ceil(Math.abs(canvasArea.x) / 100) * 100
        this.processedCanvasSize.width += offset.x
      }
      if (canvasArea.y < 0) {
        offset.y = Math.ceil(Math.abs(canvasArea.y) / 100) * 100
        this.processedCanvasSize.height += offset.y
      }
      charts.forEach((chart) => chart.moveByOffset(offset))
      if (canvasArea.x < 0 || canvasArea.y < 0) {
        this.$refs.chartzone.moveCanvas(offset)
      }

      // 获取调整 x, y 后的区域
      canvasArea = getAreaByCharts(charts)

      const maxRight = canvasArea.x + canvasArea.width
      const maxBottom = canvasArea.y + canvasArea.height

      this.processedCanvasSize.width = this.canvasSize.width + Math.ceil(Math.max(maxRight - this.canvasSize.width, 0) / 100) * 100
      this.processedCanvasSize.height = this.canvasSize.height + Math.ceil(Math.max(maxBottom - this.canvasSize.height, 0) / 100) * 100
    },

    // #region 撤销、重做功能
    /** 拍摄快照 */
    takeSnapshot () {
      if (this.readonly) return
      this.snapshots.unshift(cloneDeep(this.flowChartData))
      while (this.snapshots.length + 1 > this.maxSnapshots) {
        this.snapshots.pop()
      }
      this.redoStack = []

      this.updateProcessedCanvasSize()
    },

    /** 使用当前的数据替换最新的快照 */
    replaceSnapshot () {
      if (this.readonly) return
      this.snapshots[0] = cloneDeep(this.flowChartData)
    },

    /** 撤销 */
    undo () {
      if (this.readonly) return
      if (this.snapshots.length <= 1) return
      this.resetFlowChartData(this.snapshots[1])
      this.redoStack.unshift((this.snapshots.shift() as FlowChartData))

      this.updateProcessedCanvasSize()
    },

    /** 重做 */
    redo () {
      if (this.readonly) return
      if (!this.redoStack.length) return
      const redoShift = (this.redoStack.shift() as FlowChartData)
      this.resetFlowChartData(redoShift)
      this.snapshots.unshift(redoShift)

      this.updateProcessedCanvasSize()
    },

    /** 还原为最新的快照状态，即 snapshot[0] */
    revert () {
      if (this.readonly) return
      if (!this.snapshots.length) return
      this.resetFlowChartData(this.snapshots[0])

      this.updateProcessedCanvasSize()
    },

    /** 将当前状态设置为初始的快照状态，即 snapshot[0] */
    fixSnapshot () {
      if (this.readonly) return
      this.snapshots = []
      this.takeSnapshot()
    },

    resetFlowChartData (data: FlowChartData) {
      const selectedCharts = this.getSelectedCharts()
      this.flowChartData.clearCharts()
      this.$nextTick(() => {
        this.flowChartData = cloneDeep(data)
        this.flowChartData.updateNodesRecord()
        this.$nextTick(() => {
          this.clearSelectedCharts()
          selectedCharts.forEach((chart) => {
            this.$refs.chartzone.selectChart(chart.id, false)
          })
          this.$refs.flowchart.focus()
        })
      })
    },
    // #endregion

    /** 处理拖拽区域 mousedown 事件 */
    handleDragZoneNodeMouseDown (node: FlowChartNode, event: MouseEvent) {
      for (let handler of this.eventHandlers.onDragZoneNodeMouseDown) {
        handler.call(this, node, event)
      }
    },

    /** 处理创建节点时的 mousemove 事件 */
    handleFlowChartMouseMove (event: MouseEvent) {
      for (let handler of this.eventHandlers.onFlowChartMouseMove) {
        handler.call(this, event)
      }
    },

    handleDocumentMouseUp (event: MouseEvent) {
      for (let handler of this.eventHandlers.onDocumentMouseUp) {
        handler.call(this, event)
      }
    },

    handleDeleteCharts (event: KeyboardEvent) {
      if (this.readonly) return
      // Vue 的 .delete 包含 Backspace 键，因此在这里再过滤
      if (event.code === 'Delete' || event.keyCode === 46) {
        this.deleteCharts(this.getSelectedCharts().map((chart) => chart.id))
      }
    },

    handleFlowChartKeyDown (event: KeyboardEvent) {
      if (event.code in arrowKeyEnum) {
        event.preventDefault()
        let step = 10
        if (event.ctrlKey || event.shiftKey) {
          step = 1
        }
        const offset = {
          x: step,
          y: step,
        }
        if (event.code === arrowKeyEnum.ArrowLeft) {
          offset.x *= -1
          offset.y = 0
        } else if (event.code === arrowKeyEnum.ArrowRight) {
          offset.y = 0
        } else if (event.code === arrowKeyEnum.ArrowUp) {
          offset.x = 0
          offset.y *= -1
        } else {
          offset.x = 0
        }
        this.$refs.chartzone.moveSelectedCharts(offset)
        this.takeSnapshot()
      }
    },

    /** 处理 Ctrl 键被按下 */
    handleCtrlKeyDown (event: KeyboardEvent) {
      if (this.readonly) return
      if (event.code === 'KeyZ') {
        // 处理撤销
        this.undo()
      } else if (event.code === 'KeyY') {
        // 处理重做
        this.redo()
      } else if (event.code === 'KeyA') {
        event.preventDefault()
        // 全选
        this.flowChartData.getCharts().forEach((chart) => {
          this.$refs.chartzone.selectChart(chart.id, false)
        })
      }
    },
  },
  mounted () {
    this.updateProcessedCanvasSize()

    document.addEventListener('mouseup', this.handleDocumentMouseUp)

    // 绑定处理事件
    const hookReturnValue: IHookReturnValue[] = [
      useCreateNode(this, useAttachLine(this.$refs.chartzone)),
    ]

    hookReturnValue.forEach((returnValue) => {
      for (let key in returnValue) {
        const k = key as keyof IHookReturnValue
        const v = returnValue[k] as IHookReturnValue[typeof k]
        const handlers = this.eventHandlers[k] as Array<IHookReturnValue[typeof k]>
        handlers.push(v)
      }
    })
  },
  beforeDestroy () {
    document.removeEventListener('mouseup', this.handleDocumentMouseUp)
  },
  watch: {
    data (newVal) {
      this.flowChartData = new FlowChartData(newVal, this.controlMap)
      this.snapshots = [cloneDeep(this.flowChartData)]
      this.redoStack = []
      this.clearSelectedCharts()
      this.updateProcessedCanvasSize()
    },

    controlMap (newVal) {
      this.flowChartData.updateControlMap(newVal as IControlMap)
    },

    snapshots: {
      immediate: true,
      handler () {
        const undoable = this.snapshots.length > 1
        this.$emit('undo-change', undoable)
      },
    },

    redoStack: {
      immediate: true,
      handler () {
        const redoable = !!this.redoStack.length
        this.$emit('redo-change', redoable)
      },
    },
  },
})
</script>
