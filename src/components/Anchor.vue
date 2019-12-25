<template>
  <div
    :class="[
      `${prefixCls}__anchor-container`,
      {
        [`${prefixCls}__anchor-container_selected`]: isSelected,
        [`${prefixCls}__anchor-container_readonly`]: readonly,
      },
    ]"
    :style="{
      left: `${node.style.x * canvasScale + canvasPadding}px`,
      top: `${node.style.y * canvasScale + canvasPadding}px`,
    }"
  >
    <div
      v-for="(anchor, index) in node.anchors"
      :key="index"
      :class="[
        `${prefixCls}__anchor`,
        {
          [`${prefixCls}__anchor_not-allowed`]: isAnchorNotAllowed(anchor),
          [`${prefixCls}__anchor_will-link`]: isAnchorToBeLinked(anchor),
        },
      ]"
      :style="getAnchorStyle(anchor)"
      @mousedown="handleAnchorMouseDown(anchor)"
      @mouseup="handleAnchorMouseUp(anchor, $event)"
      @mousemove="handleAnchorMouseMove(anchor, $event)"
    ></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { IControl, IControlAnchor, IControlMap } from '../interfaces'
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store'
import { controlMap } from '../store/control-map'
import { get } from '../utils'
import { isLinkOperationValid } from '../utils/link'
import { CLASS_PREFIX, DEFAULT_CONTROL_STYLE } from '../const'
import cloneDeep from 'lodash.clonedeep'

const prefixCls = `${CLASS_PREFIX}-node`

/** 节点边框宽度 */
const nodeBoundarySize = 1

/** 锚点尺寸的一半 */
const anchorHalfSize = 4

export default Vue.extend({
  name: 'Anchor',
  props: {
    /** 节点 */
    node: {
      required: true,
      type: Object as () => FlowChartNode,
    },

    /** 完整的流程图数据 */
    flowChartData: {
      required: true,
      type: Object as () => FlowChartData,
    },

    isCreatingLink: Boolean,

    createLink: Object as () => {
      startNodeId: string | null,
      startAnchor: { x: number, y: number },
      startCoordinate: { x: number, y: number },
      endNodeId: string | null,
      endAnchor: { x: number, y: number },
      endCoordinate: { x: number, y: number },
    },

    isMovingLinkAnchor: Boolean,

    moveLinkAnchor: Object as () => FlowChartLink | null,

    /** 对应节点是否被选中 */
    isSelected: Boolean,

    /** 控件是否只读 */
    readonly: Boolean,

    canvasScale: Number,

    canvasPadding: Number,
  },
  data () {
    return {
      prefixCls,
    }
  },
  methods: {
    getAnchorStyle (anchor: IControlAnchor) {
      const position = this.getAnchorPosition(anchor)
      return {
        top: `${position.top}px`,
        left: `${position.left}px`,
      }
    },

    /**
     * 获取锚点相对于节点的位置
     * @param anchor 锚点位置信息
     */
    getAnchorPosition (anchor: IControlAnchor) {
      const { width, height } = this.node.style
      return {
        top: (height * this.canvasScale - nodeBoundarySize) * anchor.y - anchorHalfSize,
        left: (width * this.canvasScale - nodeBoundarySize) * anchor.x - anchorHalfSize,
      }
    },

    /** 锚点是否不允许连线 */
    isAnchorNotAllowed (anchor: IControlAnchor): boolean {
      /**
       * 综合 utils/link.ts 来看，分两种情况来看
       *
       * 一、没有创建或移动连线的时候
       * 1. 输出连线数量超过控件或锚点限制
       *
       * 二、创建或移动连线的时候
       * 有三种情况是禁止的， 调用 utils/link.ts 中的方法即可：
       * 1. 控件禁止连接自身
       * 2. 输出连线数量超过控件或锚点限制
       * 3. 输入连线数量超过控件或锚点限制
       */
      if (!this.node.control) return false

      if (!this.isCreatingLink && !this.isMovingLinkAnchor) {
        const links = this.flowChartData.links
        const outLinks = links.filter((link) => link.startNodeId === this.node.id)
        if (outLinks.length === get(this.node.control.maxLinkOut, Infinity)) return true
        if (outLinks.length === get(anchor.maxOut, Infinity)) return true
      }

      if (this.isCreatingLink) {
        const newLink = {
          id: '',
          ...this.createLink,
          ...{
            endNodeId: this.node.id,
            endAnchor: anchor,
          },
        }
        return !isLinkOperationValid(newLink as FlowChartLink, this.flowChartData)
      }

      if (this.isMovingLinkAnchor) {
        return !isLinkOperationValid(this.moveLinkAnchor as FlowChartLink, this.flowChartData)
      }

      return false
    },

    /** 锚点是否将被连接 */
    isAnchorToBeLinked (anchor: IControlAnchor): boolean {
      if (this.isCreatingLink) {
        // 如果是创建连线
        const createAnchor = this.createLink.endAnchor
        return this.createLink.endNodeId === this.node.id && createAnchor.x === anchor.x && createAnchor.y === anchor.y
      }
      if (this.isMovingLinkAnchor && this.moveLinkAnchor) {
        // 如果是移动连线锚点
        return (
          this.moveLinkAnchor.startNodeId === this.node.id && this.moveLinkAnchor.startAnchor.x === anchor.x && this.moveLinkAnchor.startAnchor.y === anchor.y ||
          this.moveLinkAnchor.endNodeId === this.node.id && this.moveLinkAnchor.endAnchor.x === anchor.x && this.moveLinkAnchor.endAnchor.y === anchor.y
        )
      }
      return false
    },

    /** 处理锚点 mousedown 事件 */
    handleAnchorMouseDown (anchor: IControlAnchor) {
      if (anchor.disableOut) return
      if (this.isAnchorNotAllowed(anchor)) return
      this.$emit('node-anchor-mousedown', this.node, anchor)
    },

    /** 处理锚点 mouseup 事件 */
    handleAnchorMouseUp (anchor: IControlAnchor, event: MouseEvent) {
      if (anchor.disableIn) return
      this.$emit('node-anchor-mouseup', this.node, anchor, event)
    },

    handleAnchorMouseMove (anchor: IControlAnchor, event: MouseEvent) {
      this.$emit('node-anchor-mousemove', this.node, anchor, event)
    },
  },
})
</script>
