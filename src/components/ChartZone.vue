<template>
  <div :class="prefixCls">
    <div
      v-if="$scopedSlots['top-bar']"
      :class="`${prefixCls}__bar ${prefixCls}__bar-top`"
    >
      <slot name="top-bar"></slot>
    </div>
    <div
      ref="background"
      :class="`${prefixCls}__background`"
      @mousedown="handleBackgroundMouseDown"
      @mousemove="handleBackgroundMouseMove"
      @mouseup="handleBackgroundMouseUp"
    >
      <div
        ref="canvas"
        :class="`${prefixCls}__canvas`"
        :style="{
          width: `${canvasSize.width * canvasScale}px`,
          height: `${canvasSize.height * canvasScale}px`,
          padding: `${canvasPadding}px`,
        }"
      >
        <div
          :class="`${prefixCls}__canvas-background`"
          :style="{
            width: `${canvasSize.width * canvasScale}px`,
            height: `${canvasSize.height * canvasScale}px`,
            marginTop: `${canvasPadding}px`,
            marginLeft: `${canvasPadding}px`,
          }"
        ></div>
        <Node
          v-for="node in flowChartData.nodes"
          :key="node.id"
          :class="chartClassNameMethod(node)"
          :node="node"
          :isSelected="isNodeSelected(node)"
          :isChartEditable="isChartEditable"
          :readonly="readonly"
          :canvasScale="canvasScale"
          :canvasPadding="canvasPadding"
          :flowChartData="flowChartData"
          :injectProps="provideChartProps"
          @node-mousedown="handleNodeMouseDown"
          @node-ctrl-mousedown="handleNodeCtrlMouseDown"
          @node-mousemove="handleNodeMouseMove"
          @node-mousemove-outside="handleNodeMouseMoveOutside"
          @take-snapshot="$listeners['take-snapshot']"
          @replace-snapshot="$listeners['replace-snapshot']"
        />
        <Link
          v-for="link in flowChartData.links"
          :key="link.id"
          :class="chartClassNameMethod(link)"
          :link="link"
          :nodes="flowChartData.nodes"
          :linkEditor="linkEditor"
          :linkEditorWidth="linkEditorWidth"
          :linkEditorHeight="linkEditorHeight"
          :isSelected="isLinkSelected(link)"
          :isChartEditable="isChartEditable"
          :linkArrowWidth="linkArrowWidth"
          :linkArrowHeight="linkArrowHeight"
          :readonly="readonly"
          :canvasScale="canvasScale"
          :canvasPadding="canvasPadding"
          :flowChartData="flowChartData"
          :injectProps="provideChartProps"
          @link-mousedown="handleLinkMouseDown"
          @link-ctrl-mousedown="handleLinkCtrlMouseDown"
          @link-start-anchor-mousedown="handleLinkStartAnchorMouseDown"
          @link-end-anchor-mousedown="handleLinkEndAnchorMouseDown"
          @link-text-change="handleLinkTextChange"
          @take-snapshot="$listeners['take-snapshot']"
          @replace-snapshot="$listeners['replace-snapshot']"
        />
        <!-- 新创建节点 -->
        <Node
          v-show="isCreatingNode && isMouseInsideCanvas"
          :style="tailZStyle"
          :flowChartData="{}"
          :node="createNode"
          :canvasScale="canvasScale"
          :canvasPadding="canvasPadding"
          :readonly="true"
          :isThumbnail="true"
        />
        <!-- 新创建连线 -->
        <Link
          v-show="isCreatingLink"
          :style="tailZStyle"
          :flowChartData="flowChartData"
          :link="createLink"
          :nodes="flowChartData.nodes"
          :linkArrowWidth="linkArrowWidth"
          :linkArrowHeight="linkArrowHeight"
          :readonly="true"
          :canvasScale="canvasScale"
          :canvasPadding="canvasPadding"
        />
        <!-- Resizer, 整个画布中只要有一个 Resizer 跟一个边框就够了 -->
        <Resizer
          v-show="shouldResizerFrameShow"
          :style="tailZStyle"
          :controlStyle="resizerArea"
          :showResizers="showResizers"
          :canvasScale="canvasScale"
          :canvasPadding="canvasPadding"
          @resizer-mousedown="handleResizerMouseDown"
        />
        <template v-for="node in flowChartData.nodes">
          <Anchor
            :key="`anchor-${node.id}`"
            :style="tailZStyle"
            :node="node"
            :flowChartData="flowChartData"
            :isCreatingLink="isCreatingLink"
            :createLink="createLink"
            :isMovingLinkAnchor="isMovingLinkAnchor"
            :moveLinkAnchor="moveLinkAnchor"
            :isSelected="(isNodeSelected(node) || isMouseMoveNode(node)) && !isSelectingArea"
            :readonly="readonly"
            :canvasScale="canvasScale"
            :canvasPadding="canvasPadding"
            @node-anchor-mousedown="handleAnchorMouseDown"
            @node-anchor-mouseup="handleAnchorMouseUp"
            @node-anchor-mousemove="handleAnchorMouseMove"
          />
        </template>
        <div
          v-show="isSelectingArea"
          :class="`${prefixCls}__selecting-area`"
          :style="{
            ...selectingAreaStyle,
            ...tailZStyle,
          }"
        ></div>
        <AttachLine
          v-show="isCreatingNode || isMovingChart || isResizingNode"
          :style="tailZStyle"
          :horizontalLine="attachLine.horizontal"
          :verticalLine="attachLine.vertical"
          :canvasScale="canvasScale"
          :canvasSize="canvasSize"
          :canvasPadding="canvasPadding"
        />
      </div>
    </div>
    <div
      v-if="$scopedSlots['bottom-bar']"
      :class="`${prefixCls}__bar ${prefixCls}__bar-bottom`"
    >
      <slot name="bottom-bar"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import Node from './Node.vue'
import Link from './Link.vue'
import Anchor from './Anchor.vue'
import Resizer from './Resizer.vue'
import AttachLine from './AttachLine.vue'
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store'
import { CLASS_PREFIX, linkTypeEnum } from '../const'
import { ICanvasSize, ICanvasArea, IControlAnchor, ICanvasCoordinate } from '../interfaces'
import { getMousePositionRelativeToElement, getDistance, getScaledCoordinate } from '../utils'
import { isLinkOperationValid } from '../utils/link'
import { getAreaByCharts, getArea } from '../utils/area'
import FlowChartSet, { getSetArray } from '../utils/set'
import {
  useAttachLine,
  useCreateLink,
  useMoveChart,
  useMoveLinkAnchor,
  useMovePolyline,
  useResizeNode,
  useSelectArea,
} from '../hooks/chartzone'
import cloneDeep from 'lodash.clonedeep'

const prefixCls = `${CLASS_PREFIX}-chart-zone`

const linkPrefixCls = `${CLASS_PREFIX}-link`

/** 创建连线默认位置信息，每次 createLink 结束后需要重置 */
const createLinkStartDefault = {
  startNodeId: null as string | null,
  startAnchor: { x: 0, y: 0 },
  startCoordinate: { x: 0, y: 0 },
}

const createLinkEndDefault = {
  endNodeId: null as string | null,
  endAnchor: { x: 0, y: 0 },
  endCoordinate: { x: 0, y: 0 },
}

/** 缩放点坐标 key */
type ResizerAnchorKeyType = '00' | '10' | '01' | '11'

interface IHookReturnValue {
  onBackgroundMouseDown?: (event: MouseEvent) => void,
  onBackgroundMouseMove?: (event: MouseEvent) => void,
  onBackgroundMouseUp?: (event: MouseEvent) => void,
  onNodeMouseDown?: (node: FlowChartNode, event: MouseEvent) => void,
  onNodeCtrlMouseDown?: (node: FlowChartNode, event: MouseEvent) => void,
  onNodeMouseMove?: (node: FlowChartNode, event: MouseEvent, anchor: IControlAnchor) => void,
  onAnchorMouseDown?: (node: FlowChartNode, anchor: IControlAnchor) => void,
  onAnchorMouseMove?: (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => void,
  onAnchorMouseUp?: (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => void,
  onResizerMouseDown?: (event: MouseEvent, direction: ResizerAnchorKeyType) => void,
  onLinkMouseDown?: (link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => void,
  onLinkCtrlMouseDown?: (link: FlowChartLink, event: MouseEvent) => void,
  onLinkStartAnchorMouseDown?: (link: FlowChartLink, event: MouseEvent) => void,
  onLinkEndAnchorMouseDown?: (link: FlowChartLink, event: MouseEvent) => void,
}

type RequiredHookReturnValue = Required<IHookReturnValue>

export default (Vue as VueConstructor<Vue & {
  $refs: {
    canvas: HTMLDivElement,
    background: HTMLDivElement,
  },
}>).extend({
  name: 'ChartZone',
  inheritAttrs: false,
  components: {
    Node,
    Link,
    Anchor,
    Resizer,
    AttachLine,
  },
  props: {
    /** 流程图数据 */
    flowChartData: {
      required: true,
      type: Object as () => FlowChartData,
    },

    isCreatingNode: Boolean,

    isMouseInsideCanvas: Boolean,

    flowChartCreateNode: Object as () => FlowChartNode,

    /** 连线类型 */
    linkType: String as () => linkTypeEnum,

    /** 连线编辑组件 */
    linkEditor: Object as () => VueConstructor,

    /** 连线编辑区域宽 */
    linkEditorWidth: Number,

    /** 连线编辑区域高 */
    linkEditorHeight: Number,

    /** 是否允许自由连线 */
    allowFreeLink: Boolean,

    /** 给每个元素上附加的 class */
    chartClassNameMethod: Function as unknown as () => (chart: FlowChartNode | FlowChartLink) => object | Array<object | string> | string,

    /** 判断元素是否可编辑 */
    isChartEditable: Function as unknown as () => (chart: FlowChartNode | FlowChartLink) => boolean,

    /** 画布缩放大小 */
    canvasScale: Number,

    /** 画布尺寸 */
    canvasSize: Object as () => ICanvasSize,

    /** 画布内边距 */
    canvasPadding: Number,

    /** 连线末尾箭头长度 */
    linkArrowWidth: Number,

    /** 连线末尾箭头高度 */
    linkArrowHeight: Number,

    readonly: Boolean,

    /** 每一个元素都会接收到的，从外部传入的 props ，类型为任意 */
    provideChartProps: {},
  },
  data () {
    return {
      prefixCls,

      linkPrefixCls,

      /** 选中的节点与连线集合 */
      selectedChartSet: new FlowChartSet() as FlowChartSet<FlowChartNode | FlowChartLink>,

      /** 是否正在选择一个区域 */
      isSelectingArea: false,

      /** 选择区域起点记录 */
      selectingAreaStart: { x: 0, y: 0 } as ICanvasCoordinate,

      /** 选择区域终点记录 */
      selectingAreaEnd: { x: 0, y: 0 } as ICanvasCoordinate,

      /** 是否显示成组元素 */
      isGroupShow: false,

      mouseMoveNodeId: null as string | null,

      /** 是否正在移动元素 */
      isMovingChart: false,

      /** 是否正在缩放节点 */
      isResizingNode: false,

      /** 是否正在移动连线锚点 */
      isMovingLinkAnchor: false,

      /** 正在移动锚点中的连线 */
      moveLinkAnchor: null as FlowChartLink | null,

      /** 是否正在创建连线 */
      isCreatingLink: false,

      createLink: new FlowChartLink({
        ...cloneDeep(createLinkStartDefault),
        ...cloneDeep(createLinkEndDefault),
        linkType: this.linkType,
      }),

      createNode: new FlowChartNode({
        controlName: '',
        style: {},
      }),

      attachLine: {
        horizontal: NaN,
        vertical: NaN,
      },

      eventHandlers: {
        onBackgroundMouseDown: [] as Array<RequiredHookReturnValue['onBackgroundMouseDown']>,
        onBackgroundMouseMove: [] as Array<RequiredHookReturnValue['onBackgroundMouseMove']>,
        onBackgroundMouseUp: [] as Array<RequiredHookReturnValue['onBackgroundMouseUp']>,
        onNodeMouseDown: [] as Array<RequiredHookReturnValue['onNodeMouseDown']>,
        onNodeCtrlMouseDown: [] as Array<RequiredHookReturnValue['onNodeCtrlMouseDown']>,
        onNodeMouseMove: [] as Array<RequiredHookReturnValue['onNodeMouseMove']>,
        onAnchorMouseDown: [] as Array<RequiredHookReturnValue['onAnchorMouseDown']>,
        onAnchorMouseMove: [] as Array<RequiredHookReturnValue['onAnchorMouseMove']>,
        onAnchorMouseUp: [] as Array<RequiredHookReturnValue['onAnchorMouseUp']>,
        onResizerMouseDown: [] as Array<RequiredHookReturnValue['onResizerMouseDown']>,
        onLinkMouseDown: [] as Array<RequiredHookReturnValue['onLinkMouseDown']>,
        onLinkCtrlMouseDown: [] as Array<RequiredHookReturnValue['onLinkCtrlMouseDown']>,
        onLinkStartAnchorMouseDown: [] as Array<RequiredHookReturnValue['onLinkStartAnchorMouseDown']>,
        onLinkEndAnchorMouseDown: [] as Array<RequiredHookReturnValue['onLinkEndAnchorMouseDown']>,
      },
    }
  },
  computed: {
    /** 尾部元素的 z-index ，永远置于上层 */
    tailZStyle (): object {
      return {
        zIndex: this.flowChartData.getMaxZ() + 1,
      }
    },

    selectingAreaStyle (): object {
      const area = getArea([this.selectingAreaStart, this.selectingAreaEnd])
      return {
        width: `${area.width * this.canvasScale}px`,
        height: `${area.height * this.canvasScale}px`,
        top: `${area.y * this.canvasScale + this.canvasPadding}px`,
        left: `${area.x * this.canvasScale + this.canvasPadding}px`,
      }
    },

    resizerArea (): ICanvasArea {
      return getAreaByCharts(getSetArray(this.selectedChartSet))
    },

    showResizers (): boolean {
      const chart = getSetArray(this.selectedChartSet)[0]
      return this.selectedChartSet.size === 1 && chart instanceof FlowChartNode && chart.control.resizable
    },

    /** 是否应该显示 Resizer 边框 */
    shouldResizerFrameShow (): boolean {
      return this.selectedChartSet.size > 1 || this.showResizers
    },
  },
  methods: {
    /** 设置选中的元素 */
    selectChart (id: string, clear: boolean = true) {
      if (clear) {
        this.selectedChartSet.clear()
      }
      const chart = this.flowChartData.findChartById(id)
      if (chart) {
        this.selectedChartSet.add(chart)
      }
    },

    /** 取消选中元素 */
    unselectChart (id: string) {
      const chart = this.flowChartData.findChartById(id)
      if (chart) {
        this.selectedChartSet.delete(chart)
      }
    },

    /** 移动选中的元素 */
    moveSelectedCharts (offset: ICanvasCoordinate) {
      this.selectedChartSet.forEach((chart) => {
        chart.moveByOffset(offset)
      })
      // 连线两端都在节点上，且不在选中元素里，需要手动再平移一下
      this.flowChartData.links.forEach((link) => {
        if (link.startNodeId && link.endNodeId) {
          const startNode = this.flowChartData.findChartById(link.startNodeId) as FlowChartNode
          const endNode = this.flowChartData.findChartById(link.endNodeId) as FlowChartNode
          if (this.selectedChartSet.has(startNode) && this.selectedChartSet.has(endNode) && !this.selectedChartSet.has(link)) {
            link.moveByOffset(offset)
          }
        }
      })
    },

    /** 移动画布 */
    moveCanvas (offset: ICanvasCoordinate) {
      this.$refs.background.scrollTop += (offset.y * this.canvasScale)
      this.$refs.background.scrollLeft += (offset.x * this.canvasScale)
    },

    /** 创建连线 */
    createNewLink () {
      const newLink = {
        ...this.createLink,
        id: '',
        linkType: this.linkType,
        linkData: {
          text: '',
        },
      }
      delete newLink.z
      if (isLinkOperationValid(newLink as FlowChartLink, this.flowChartData) && (!this.allowFreeLink && !this.createLink.isLinkFree() || this.allowFreeLink)) {
        this.$emit('add-link', newLink)
      } else {
        this.$emit('revert-snapshot')
      }
    },

    /** 获取鼠标相对于画布的坐标位置信息 */
    getMouseCoordinate (event: MouseEvent): ICanvasCoordinate {
      const mouseRelativePosition = getMousePositionRelativeToElement(event, this.$refs.canvas)
      return {
        x: Math.trunc((mouseRelativePosition.x - this.canvasPadding) / this.canvasScale),
        y: Math.trunc((mouseRelativePosition.y - this.canvasPadding) / this.canvasScale),
      }
    },

    /** 获取最近的锚点 */
    getNearestAnchor (mouseCoordinate: ICanvasCoordinate, node: FlowChartNode) {
      let nearestAnchor: IControlAnchor = { x: 0, y: 0 }
      let minDistance = Infinity
      node.anchors.forEach((anchor, index) => {
        const anchorCoordinate = getScaledCoordinate(node.getAnchorCoordinate(anchor), this.canvasScale)
        const distance = getDistance(anchorCoordinate, mouseCoordinate)
        if (distance < minDistance) {
          minDistance = distance
          nearestAnchor = anchor
        }
      })
      return nearestAnchor
    },

    /** 根据 id 判断连线是否被选中 */
    isLinkSelected (link: FlowChartLink) {
      return this.selectedChartSet.has(link)
    },

    /** 根据 id 判断节点是否被选中 */
    isNodeSelected (node: FlowChartNode) {
      return this.selectedChartSet.has(node)
    },

    /** 判断鼠标是否经过此节点 */
    isMouseMoveNode (node: FlowChartNode) {
      return this.mouseMoveNodeId === node.id
    },

    handleBackgroundMouseDown (event: MouseEvent) {
      for (let handler of this.eventHandlers.onBackgroundMouseDown) {
        handler.call(this, event)
      }
    },

    handleBackgroundMouseMove (event: MouseEvent) {
      if (this.readonly) return

      for (let handler of this.eventHandlers.onBackgroundMouseMove) {
        handler.call(this, event)
      }
    },

    handleBackgroundMouseUp (event: MouseEvent) {
      if (this.readonly) return

      for (let handler of this.eventHandlers.onBackgroundMouseUp) {
        handler.call(this, event)
      }
    },

    handleNodeMouseDown (node: FlowChartNode, event: MouseEvent) {
      if (this.readonly) return

      for (let handler of this.eventHandlers.onNodeMouseDown) {
        handler.call(this, node, event)
      }
    },

    handleNodeCtrlMouseDown (node: FlowChartNode, event: MouseEvent) {
      if (this.readonly) return

      for (let handler of this.eventHandlers.onNodeCtrlMouseDown) {
        handler.call(this, node, event)
      }
    },

    handleNodeMouseMove (node: FlowChartNode, event: MouseEvent) {
      if (this.readonly) return

      this.mouseMoveNodeId = node.id

      const mousePosition = getMousePositionRelativeToElement(event, this.$refs.canvas)
      const mouseCoordinate = {
        x: Math.trunc(mousePosition.x - this.canvasPadding),
        y: Math.trunc(mousePosition.y - this.canvasPadding),
      }
      const anchor = this.getNearestAnchor(mouseCoordinate, node)

      for (let handler of this.eventHandlers.onNodeMouseMove) {
        handler.call(this, node, event, anchor)
      }
    },

    handleNodeMouseMoveOutside (node: FlowChartNode) {
      if (this.readonly) return

      if (this.mouseMoveNodeId === node.id) {
        this.mouseMoveNodeId = null
      }
    },

    handleAnchorMouseDown (node: FlowChartNode, anchor: IControlAnchor) {
      for (let handler of this.eventHandlers.onAnchorMouseDown) {
        handler.call(this, node, anchor)
      }
    },

    handleAnchorMouseMove (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) {
      event.stopPropagation()

      for (let handler of this.eventHandlers.onAnchorMouseMove) {
        handler.call(this, node, anchor, event)
      }
    },

    handleAnchorMouseUp (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) {
      // 这里停止冒泡防止在 background mouseup 中再处理一次
      event.stopPropagation()

      for (let handler of this.eventHandlers.onAnchorMouseUp) {
        handler.call(this, node, anchor, event)
      }
    },

    /** TODO: 更新节点坐标，在 resize 与 rotate 后执行，中心点不变，改变 x, y */
    // updateNodeCoordinate (node: FlowChartNode) {
    //   node.getNodeContainerSize()
    // },

    handleResizerMouseDown (event: MouseEvent, direction: ResizerAnchorKeyType) {
      for (let handler of this.eventHandlers.onResizerMouseDown) {
        handler.call(this, event, direction)
      }
    },

    handleLinkMouseDown (link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) {
      if (this.readonly) return

      for (let handler of this.eventHandlers.onLinkMouseDown) {
        handler.call(this, link, event, isPolyline, polylineIndex)
      }
    },

    handleLinkCtrlMouseDown (link: FlowChartLink, event: MouseEvent) {
      if (this.readonly) return

      for (let handler of this.eventHandlers.onLinkCtrlMouseDown) {
        handler.call(this, link, event)
      }
    },

    handleLinkStartAnchorMouseDown (link: FlowChartLink, event: MouseEvent) {
      if (this.readonly) return

      for (let handler of this.eventHandlers.onLinkStartAnchorMouseDown) {
        handler.call(this, link, event)
      }
    },

    handleLinkEndAnchorMouseDown (link: FlowChartLink, event: MouseEvent) {
      if (this.readonly) return

      for (let handler of this.eventHandlers.onLinkEndAnchorMouseDown) {
        handler.call(this, link, event)
      }
    },

    handleLinkTextChange (link: FlowChartLink, text: string) {
      link.linkData.text = text
    },
  },
  mounted () {
    // 画布居中
    this.$refs.background.scrollTop = this.canvasPadding * this.canvasScale
    this.$refs.background.scrollLeft = this.canvasPadding * this.canvasScale

    // 绑定处理事件
    const attachLineReturnValue = useAttachLine(this)
    const hookReturnValue: IHookReturnValue[] = [
      useCreateLink(this),
      useMoveChart(this, attachLineReturnValue),
      useMoveLinkAnchor(this),
      useMovePolyline(this),
      useResizeNode(this, attachLineReturnValue),
      useSelectArea(this),
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
  watch: {
    isCreatingLink (val) {
      if (!val) {
        Object.assign(this.createLink, cloneDeep(createLinkStartDefault), cloneDeep(createLinkEndDefault))
      } else {
        Object.assign(this.createLink, { linkType: this.linkType })
      }
    },

    isMovingLinkAnchor (val) {
      if (!val) {
        this.$emit('link-position-change', this.moveLinkAnchor)
      }
    },

    'selectedChartSet.size': {
      immediate: true,
      handler (val) {
        this.$emit('selected-size-change', val)
      },
    },
  },
})
</script>
