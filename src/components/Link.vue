<template>
  <div
    ref="container"
    :class="[
      prefixCls,
      {
        [`${prefixCls}_same-node`]: isLinkingSameNode,
      },
    ]"
    :style="{
      width: `${linkWidth * canvasScale}px`,
      height: `${linkHeight * canvasScale}px`,
      left: `${linkLeft * canvasScale + this.canvasPadding}px`,
      top: `${linkTop * canvasScale + this.canvasPadding}px`,
      zIndex: link.z,
    }"
    tabindex="-1"
    @keydown="handleKeyDown"
  >
    <svg
      :class="`${prefixCls}__svg`"
      :width="`${linkWidth * canvasScale}px`"
      :height="`${linkHeight * canvasScale}px`"
    >
      <g :class="[
        `${prefixCls}__line`,
        {
          [`${prefixCls}__line_selected`]: isSelected,
        },
      ]">
        <!-- 连线主体 -->
        <g
          v-for="(group, index) in pathGroups"
          :key="index"
        >
          <path
            :class="`${prefixCls}__path`"
            :d="`M${group.start.x} ${group.start.y} L${group.end.x} ${group.end.y}`"
          />
          <!-- 解决点击热区过小的问题，画一个重复的 path -->
          <path
            ref="clickpath"
            :class="`${prefixCls}__path_hidden`"
            :d="`M${group.start.x} ${group.start.y} L${group.end.x} ${group.end.y}`"
            :style="{
              cursor: group.isPolyline ? (group.start.x === group.end.x ? 'ew-resize' : 'ns-resize') : (link.startNodeId || link.endNodeId ? 'pointer' : 'move'),
            }"
            @mousedown.exact="handleLinkMouseDown($event, group.isPolyline, index)"
            @mousedown.ctrl="handleLinkCtrlMouseDown"
            @dblclick="handleLinkDblClick"
          />
        </g>
        <!-- marker 实现的箭头颜色无法随连线更改，因此手动画一个箭头 -->
        <polygon
          :class="`${prefixCls}__arrow`"
          :points="arrowPoints"
        />
        <!-- 起点与终点的点击区域 -->
        <circle
          :class="[
            `${prefixCls}__anchor`,
            `${prefixCls}__anchor-start`,
          ]"
          :cx="svgStartCoordinate.x * canvasScale"
          :cy="svgStartCoordinate.y * canvasScale"
          :r="anchorSize / 2"
          @mousedown="handleStartAnchorMouseDown"
        />
        <circle
          :class="[
            `${prefixCls}__anchor`,
            `${prefixCls}__anchor-end`,
          ]"
          :cx="svgEndCoordinate.x * canvasScale"
          :cy="svgEndCoordinate.y * canvasScale"
          :r="anchorSize / 2"
          @mousedown="handleEndAnchorMouseDown"
        />
      </g>
    </svg>
    <div
      ref="editor"
      v-show="isEditing || (link.linkData && link.linkData.text)"
      :class="`${prefixCls}__editor`"
      :style="{
        width: `${linkEditorWidth}px`,
        height: `${linkEditorHeight}px`,
        ...editorPositionStyle,
      }"
      @mousedown.exact="handleLinkMouseDown"
      @mousedown.ctrl="handleLinkCtrlMouseDown"
      @dblclick="handleLinkDblClick"
    >
      <template v-if="linkEditor">
        <component
          :is="linkEditor"
          :isEditing="isEditing"
          :injectProps="injectProps"
          v-bind="$props"
          @update-data="handleUpdateLinkData"
          @delete-data="handleDeleteLinkData"
          @take-snapshot="handleTakeSnapshot"
          @replace-snapshot="handleReplaceSnapshot"
        />
      </template>
      <template v-else>
        <pre
          v-show="!isEditing && link.linkData && link.linkData.text"
          :class="[
            `${prefixCls}__editor-pre`,
          ]"
        >{{ link.linkData && link.linkData.text }}</pre>
        <textarea
          v-show="isEditing"
          ref="text"
          :class="`${prefixCls}__editor-textarea`"
          :value="link.linkData.text"
          @input="handleLinkTextChange"
        ></textarea>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store'
import { CLASS_PREFIX, DEFAULT_CONTROL_STYLE, linkTypeEnum } from '../const'
import { ICanvasCoordinate } from '../interfaces'
import { getArrowPoints } from '../utils/link'
import { getConnectionPoints } from '../utils/connection'
import Vector from '../utils/connection/vector'
import cloneDeep from 'lodash.clonedeep'

const prefixCls = `${CLASS_PREFIX}-link`

/** 连线 div 边距 */
const linkPadding = 10

/** Link 锚点尺寸 */
const anchorSize = 30

interface IStartEndCoordinate {
  startCoordinate: ICanvasCoordinate,
  endCoordinate: ICanvasCoordinate,
}

export default (Vue as VueConstructor<Vue & {
  $refs: {
    container: HTMLDivElement,
    clickpath: SVGPathElement,
    editor: HTMLDivElement,
    text: HTMLElement | undefined,
  },
  unwatchStartEndCoordinate?: Function,
  handleClickOutside: (event: MouseEvent) => void,
}>).extend({
  name: 'Link',
  props: {
    /** 连线信息 */
    link: {
      required: true,
      type: Object as () => FlowChartLink,
    },

    /** 画布上所有节点元素 */
    nodes: {
      type: Array as () => FlowChartNode[],
      default: () => [],
    },

    /** 完整的流程图数据 */
    flowChartData: {
      required: true,
      type: Object as () => FlowChartData,
    },

    /** 连线编辑组件 */
    linkEditor: Object as () => VueConstructor,

    /** 连线编辑区域宽 */
    linkEditorWidth: Number,

    /** 连线编辑区域高 */
    linkEditorHeight: Number,

    /** 从外部注入的 props */
    injectProps: {},

    /** 是否被选中 */
    isSelected: Boolean,

    /** 本节点是否成组地被选中 */
    isGroupSelected: Boolean,

    /** 判断元素是否可编辑 */
    isChartEditable: Function as unknown as () => (chart: FlowChartLink) => boolean,

    /** 连线末尾箭头长度 */
    linkArrowWidth: Number,

    /** 连线末尾箭头高度 */
    linkArrowHeight: Number,

    /** 控件是否只读 */
    readonly: Boolean,

    /** 画布缩放大小 */
    canvasScale: Number,

    /** 画布内边距 */
    canvasPadding: Number,
  },
  data () {
    return {
      prefixCls,

      anchorSize,

      /** 是否为编辑状态 */
      isEditing: false,

      /** 连线数据缓存 */
      linkDataCache: cloneDeep(this.link.linkData),
    }
  },
  computed: {
    /** 是否连接的是同一个节点 */
    isLinkingSameNode (): boolean {
      return this.link.startNodeId !== null && this.link.startNodeId === this.link.endNodeId
    },

    /** 连线起始坐标 */
    startCoordinate (): ICanvasCoordinate {
      const coordinate = this.link.startCoordinate_
      // 手动使 computed 实现 deep 监听
      return {
        x: coordinate.x,
        y: coordinate.y,
      }
    },

    /** 连线终止坐标 */
    endCoordinate (): ICanvasCoordinate {
      const coordinate = this.link.endCoordinate_
      // 手动使 computed 实现 deep 监听
      return {
        x: coordinate.x,
        y: coordinate.y,
      }
    },

    /** 连线 div 宽度 */
    linkWidth (): number {
      const { linkType, polylinePoints } = this.link
      if (linkType === linkTypeEnum.straight || linkType === linkTypeEnum.bezier) {
        return Math.abs(this.startCoordinate.x - this.endCoordinate.x) + 2 * linkPadding
      } else {
        const xs = [...polylinePoints, this.startCoordinate, this.endCoordinate].map((p) => p.x)
        return Math.max(...xs) - Math.min(...xs) + 2 * linkPadding
      }
    },

    /** 连线 div 高度 */
    linkHeight (): number {
      const { linkType, polylinePoints } = this.link
      if (linkType === linkTypeEnum.straight || linkType === linkTypeEnum.bezier) {
        return Math.abs(this.startCoordinate.y - this.endCoordinate.y) + 2 * linkPadding
      } else {
        const ys = [...polylinePoints, this.startCoordinate, this.endCoordinate].map((p) => p.y)
        return Math.max(...ys) - Math.min(...ys) + 2 * linkPadding
      }
    },

    /** 连线 div x 坐标 */
    linkLeft (): number {
      const { linkType, polylinePoints } = this.link
      if (linkType === linkTypeEnum.straight || linkType === linkTypeEnum.bezier) {
        return Math.min(this.startCoordinate.x, this.endCoordinate.x) - linkPadding
      } else {
        return Math.min(...[...polylinePoints, this.startCoordinate, this.endCoordinate].map((p) => p.x)) - linkPadding
      }
    },

    /** 连线 div y 坐标 */
    linkTop (): number {
      const { linkType, polylinePoints } = this.link
      if (linkType === linkTypeEnum.straight || linkType === linkTypeEnum.bezier) {
        return Math.min(this.startCoordinate.y, this.endCoordinate.y) - linkPadding
      } else {
        return Math.min(...[...polylinePoints, this.startCoordinate, this.endCoordinate].map((p) => p.y)) - linkPadding
      }
    },

    /** svg 相对于 Link 的起点坐标 */
    svgStartCoordinate (): ICanvasCoordinate {
      return {
        x: this.startCoordinate.x - this.linkLeft,
        y: this.startCoordinate.y - this.linkTop,
      }
    },

    /** svg 相对于 Link 的终点坐标 */
    svgEndCoordinate (): ICanvasCoordinate {
      return {
        x: this.endCoordinate.x - this.linkLeft,
        y: this.endCoordinate.y - this.linkTop,
      }
    },

    /** 返回箭头点属性 */
    arrowPoints (): string {
      let result: ICanvasCoordinate[]
      const { linkType, polylinePoints } = this.link
      if (linkType === linkTypeEnum.straight || linkType === linkTypeEnum.bezier) {
        result = getArrowPoints(this.svgStartCoordinate, this.svgEndCoordinate, this.linkArrowWidth, this.linkArrowHeight)
      } else {
        let start = this.svgStartCoordinate
        const lastPolylinePoint = polylinePoints[polylinePoints.length - 2]
        if (lastPolylinePoint) {
          start = this.getSVGPoint(lastPolylinePoint)
        }
        result = getArrowPoints(start, this.svgEndCoordinate, this.linkArrowWidth, this.linkArrowHeight)
      }
      return result.map((r) => {
        const p = this.getScaledPoint(r)
        return `${p.x} ${p.y}`
      }).join(' ')
    },

    pathGroups (): Array<{ start: ICanvasCoordinate, end: ICanvasCoordinate, isPolyline: boolean }> {
      return this.link.pathGroups.map((group) => ({
        start: this.getScaledPoint(this.getSVGPoint(group.start)),
        end: this.getScaledPoint(this.getSVGPoint(group.end)),
        isPolyline: group.isPolyline,
      }))
    },

    editorPositionStyle (): object {
      const centerLinkCoordinate = this.getSVGPoint(this.link.editorCenterCoordinate)
      return {
        top: `${centerLinkCoordinate.y - this.linkEditorHeight / 2}px`,
        left: `${centerLinkCoordinate.x - this.linkEditorWidth / 2}px`,
      }
    },
  },
  methods: {
    getSVGPoint (c: ICanvasCoordinate): ICanvasCoordinate {
      return {
        x: c.x - this.linkLeft,
        y: c.y - this.linkTop,
      }
    },

    getScaledPoint (c: ICanvasCoordinate): ICanvasCoordinate {
      return {
        x: c.x * this.canvasScale,
        y: c.y * this.canvasScale,
      }
    },

    updatePolylinePoints () {
      this.link.polylinePoints = getConnectionPoints(this.link, this.flowChartData)
    },

    handleKeyDown (event: KeyboardEvent) {
      if (this.isEditing) {
        event.stopPropagation()
      }
    },

    handleLinkMouseDown (event: MouseEvent, isPolyline: boolean, polylineIndex: number) {
      if (this.isEditing) return
      this.$emit('link-mousedown', this.link, event, isPolyline, polylineIndex)
    },

    handleLinkCtrlMouseDown (event: MouseEvent) {
      if (this.isEditing) return
      this.$emit('link-ctrl-mousedown', this.link, event)
    },

    /** 双击连线，进入编辑状态 */
    handleLinkDblClick () {
      if (this.isEditing) return
      if (this.readonly) return
      if (!this.isChartEditable(this.link)) return

      this.isEditing = true
    },

    handleStartAnchorMouseDown (event: MouseEvent) {
      this.$emit('link-start-anchor-mousedown', this.link, event)
    },

    handleEndAnchorMouseDown (event: MouseEvent) {
      this.$emit('link-end-anchor-mousedown', this.link, event)
    },

    handleUpdateLinkData (valueObj: { [key: string]: any }, takeSnapshot: boolean = false) {
      if (this.link.setData(valueObj)) {
        if (takeSnapshot) {
          this.$emit('take-snapshot')
        }
      }
    },

    handleDeleteLinkData (keys: string[], takeSnapshot: boolean = false) {
      if (this.link.deleteData(keys)) {
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

    /** 处理输入连线文字 */
    handleLinkTextChange (event: InputEvent) {
      this.$emit('link-text-change', this.link, event.target && (event.target as HTMLInputElement).value)
    },
  },
  created () {
    this.unwatchStartEndCoordinate = this.$watch(function () {
      return {
        startCoordinate: this.startCoordinate,
        endCoordinate: this.endCoordinate,
      }
    }, function (newVal, oldVal) {
      if (this.link.linkType === linkTypeEnum.polyline) {
        const newVector = new Vector(newVal.endCoordinate.x - newVal.startCoordinate.x, newVal.endCoordinate.y - newVal.startCoordinate.y)
        const oldVector = new Vector(oldVal.endCoordinate.x - oldVal.startCoordinate.x, oldVal.endCoordinate.y - oldVal.startCoordinate.y)
        // 新旧起点-终点的向量不同向且不同长，则不是整条线平移，需重新计算路径，否则平移所有拐点
        if (!newVector.isSameDirection(oldVector) || newVector.length !== oldVector.length) {
          this.updatePolylinePoints()
        }
      }
    }, {
      deep: true,
    })
  },
  mounted () {
    /** 点击了节点外面则停止编辑 */
    this.handleClickOutside = function (event: MouseEvent) {
      if (!this.$refs.container.contains(event.target as Node | null)) {
        this.isEditing = false
      }
    }
    this.handleClickOutside = this.handleClickOutside.bind(this)

    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy () {
    if (this.unwatchStartEndCoordinate) {
      this.unwatchStartEndCoordinate()
    }

    document.removeEventListener('click', this.handleClickOutside)
  },
  watch: {
    isEditing (val) {
      if (val) {
        this.linkDataCache = cloneDeep(this.link.linkData)
        this.$nextTick(() => {
          this.$refs.text && this.$refs.text.focus()
        })
      } else {
        if (JSON.stringify(this.linkDataCache) !== JSON.stringify(this.link.linkData)) {
          this.$emit('take-snapshot')
        }
      }
    },
  },
})
</script>
