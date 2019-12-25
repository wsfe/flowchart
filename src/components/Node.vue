<template>
  <div
    :class="[
      prefixCls,
      {
        [`${prefixCls}_selected`]: isSelected,
        [`${prefixCls}_readonly`]: readonly,
      },
    ]"
    :style="{
      ...containerSize,
      left: `${node.style.x * (isThumbnail ? 1 : canvasScale) + (isThumbnail ? 0 : canvasPadding)}px`,
      top: `${node.style.y * (isThumbnail ? 1 : canvasScale) + (isThumbnail ? 0 : canvasPadding)}px`,
      zIndex: node.style.z,
      transform: `scale(${canvasScale})`,
    }"
    tabindex="-1"
    @keydown="handleKeyDown"
  >
    <div
      ref="container"
      :class="`${prefixCls}__rotate-container`"
      :style="{
        width: `${node.style.width}px`,
        height: `${node.style.height}px`,
        transform: `rotate(${node.style.rotate}deg)`,
      }"
    >
      <div :class="`${prefixCls}__control-component`">
        <component
          :is="node.control.component"
          :isEditing="isEditing"
          :readonly="readonly"
          :flowChartData="flowChartData"
          :data="node.nodeData"
          :node="node"
          :isThumbnail="isThumbnail"
          :injectProps="injectProps"
          @update-data="handleUpdateNodeData"
          @delete-data="handleDeleteNodeData"
          @take-snapshot="handleTakeSnapshot"
          @replace-snapshot="handleReplaceSnapshot"
        />
      </div>
      <div
        v-show="!isEditing"
        :class="`${prefixCls}__control-mask`"
        :style="maskStyle"
        @mousedown.exact="handleMaskMouseDown"
        @mousedown.ctrl="handleMaskCtrlMouseDown"
        @dblclick="handleMaskDblClick"
      ></div>
      <!-- <div :class="`${prefixCls}__rotator`"></div> -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import { FlowChartData, FlowChartNode } from '../store'
import { CLASS_PREFIX } from '../const'
import { ifMouseInsideElement } from '../utils'
import cloneDeep from 'lodash.clonedeep'

const prefixCls = `${CLASS_PREFIX}-node`

export default (Vue as VueConstructor<Vue & {
  $refs: {
    container: HTMLDivElement,
  },
}>).extend({
  name: 'Node',
  props: {
    /** 节点信息 */
    node: {
      required: true,
      type: Object as () => FlowChartNode,
    },

    /** 完整的流程图数据，供节点内部使用 */
    flowChartData: {
      required: true,
      type: Object as () => FlowChartData,
    },

    /** 从外部注入的 props */
    injectProps: {},

    /** 是否被选中 */
    isSelected: Boolean,

    /** 本节点是否成组地被选中 */
    isGroupSelected: Boolean,

    /** 判断元素是否可编辑 */
    isChartEditable: Function as unknown as () => (chart: FlowChartNode) => boolean,

    /** 是否是作为缩略图用的节点 */
    isThumbnail: Boolean,

    /** 控件是否只读 */
    readonly: Boolean,

    /** 画布缩放大小 */
    canvasScale: Number,

    /** 画布内边距 */
    canvasPadding: Number,

    /** TODO: 是否可旋转 */
    rotatable: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      prefixCls,

      /** 是否为编辑状态 */
      isEditing: false,

      /** 节点数据缓存 */
      nodeDataCache: cloneDeep(this.node.nodeData),
    }
  },
  computed: {
    /** 遮罩样式 */
    maskStyle (): object {
      const control = this.node.control
      if (this.isThumbnail || this.readonly) {
        return {
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }
      }
      return {
        width: `${typeof control.maskWidth === 'number' ? `${control.maskWidth}px` : control.maskWidth}`,
        height: `${typeof control.maskHeight === 'number' ? `${control.maskHeight}px` : control.maskHeight}`,
        top: `${typeof control.maskOffsetY === 'number' ? `${control.maskOffsetY}px` : control.maskOffsetY}`,
        left: `${typeof control.maskOffsetX === 'number' ? `${control.maskOffsetX}px` : control.maskOffsetX}`,
      }
    },

    containerSize (): object {
      const size = this.node.getNodeContainerSize()
      return {
        width: `${size.width}px`,
        height: `${size.height}px`,
      }
    },
  },
  methods: {
    handleKeyDown (event: KeyboardEvent) {
      if (this.isEditing) {
        event.stopPropagation()
      }
    },

    handleUpdateNodeData (valueObj: { [key: string]: any }, takeSnapshot: boolean = false) {
      if (this.node.setData(valueObj)) {
        if (takeSnapshot) {
          this.$emit('take-snapshot')
        }
      }
    },

    handleDeleteNodeData (keys: string[], takeSnapshot: boolean = false) {
      if (this.node.deleteData(keys)) {
        if (takeSnapshot) {
          this.$emit('take-snapshot')
        }
      }
    },

    handleTakeSnapshot () {
      this.$emit('take-snapshot')
    },

    handleReplaceSnapshot () {
      this.$emit('replace-snapshot')
    },

    /** 点击了节点外面则停止编辑 */
    handleClickOutside (event: MouseEvent) {
      if (!this.$refs.container.contains(event.target as Node | null)) {
        this.isEditing = false
      }
    },

    /** 处理点中遮罩，即选中节点 */
    handleMaskMouseDown (event: MouseEvent) {
      this.$emit('node-mousedown', this.node, event)
    },

    /** 处理按下 Ctrl 键后的 mousedown 事件，用于成组选中 */
    handleMaskCtrlMouseDown (event: MouseEvent) {
      this.$emit('node-ctrl-mousedown', this.node, event)
    },

    /** 处理 mousemove */
    handleMouseMove (event: MouseEvent) {
      if (ifMouseInsideElement(event, this.$refs.container)) {
        this.$emit('node-mousemove', this.node, event)
      } else {
        this.$emit('node-mousemove-outside', this.node, event)
      }
    },

    /** 处理 mouseup */
    handleMouseUp (event: MouseEvent) {
      if (ifMouseInsideElement(event, this.$refs.container)) {
        this.$emit('node-mouseup', this.node, event)
      } else {
        this.$emit('node-mouseup-outside', this.node, event)
      }
    },

    /** 处理双击遮罩，即进入编辑状态 */
    handleMaskDblClick () {
      if (this.readonly) return
      if (!this.isChartEditable(this.node)) return

      this.isEditing = true
    },
  },
  mounted () {
    document.addEventListener('click', this.handleClickOutside)
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  },
  beforeDestroy () {
    document.removeEventListener('click', this.handleClickOutside)
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  },
  watch: {
    isEditing (val) {
      if (val) {
        this.nodeDataCache = cloneDeep(this.node.nodeData)
      } else {
        if (this.node.control.takeSnapshotOnEditChange) {
          if (JSON.stringify(this.nodeDataCache) !== JSON.stringify(this.node.nodeData)) {
            this.$emit('take-snapshot')
          }
        }
      }
    },
  },
})
</script>
