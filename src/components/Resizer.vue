<template>
  <div
    :class="[
      `${prefixCls}__container`,
    ]"
    :style="{
      left: `${controlStyle.x * canvasScale + canvasPadding}px`,
      top: `${controlStyle.y * canvasScale + canvasPadding}px`,
    }"
  >
    <div
      :class="`${prefixCls}__border ${prefixCls}__border_horizontal ${prefixCls}__border_top`"
      :style="{
        width: `${controlStyle.width * canvasScale}px`,
        top: 0,
      }"
    ></div>
    <div
      :class="`${prefixCls}__border ${prefixCls}__border_horizontal ${prefixCls}__border_bottom`"
      :style="{
        width: `${controlStyle.width  * canvasScale}px`,
        top: `${controlStyle.height * canvasScale - 1}px`,
      }"
    ></div>
    <div
      :class="`${prefixCls}__border ${prefixCls}__border_vertical ${prefixCls}__border_left`"
      :style="{
        height: `${controlStyle.height * canvasScale}px`,
        left: 0,
      }"
    ></div>
    <div
      :class="`${prefixCls}__border ${prefixCls}__border_vertical ${prefixCls}__border_right`"
      :style="{
        height: `${controlStyle.height * canvasScale}px`,
        left: `${controlStyle.width * canvasScale - 1}px`,
      }"
    ></div>
    <template v-if="showResizers">
      <div
        :class="`${prefixCls}__resizer ${prefixCls}__resizer_top-left`"
        :style="{
          top: `${-resizerHalfSize}px`,
          left: `${-resizerHalfSize}px`,
        }"
        @mousedown="handleResizerMouseDown($event, '00')"
      ></div>
      <div
        :class="`${prefixCls}__resizer ${prefixCls}__resizer_top-right`"
        :style="{
          top: `${-resizerHalfSize}px`,
          left: `${controlStyle.width * canvasScale - resizerHalfSize - 1}px`,
        }"
        @mousedown="handleResizerMouseDown($event, '10')"
      ></div>
      <div
        :class="`${prefixCls}__resizer ${prefixCls}__resizer_bottom-left`"
        :style="{
          top: `${controlStyle.height * canvasScale - resizerHalfSize - 1}px`,
          left: `${-resizerHalfSize}px`,
        }"
        @mousedown="handleResizerMouseDown($event, '01')"
      ></div>
      <div
        :class="`${prefixCls}__resizer ${prefixCls}__resizer_bottom-right`"
        :style="{
          top: `${controlStyle.height * canvasScale - resizerHalfSize - 1}px`,
          left: `${controlStyle.width * canvasScale - resizerHalfSize - 1}px`,
        }"
        @mousedown="handleResizerMouseDown($event, '11')"
      ></div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { IControlStyle, IFlowChartNode } from '../interfaces'
import { CLASS_PREFIX, DEFAULT_CONTROL_STYLE } from '../const'

const prefixCls = `${CLASS_PREFIX}-resizer`

const resizerHalfSize = 4

export default Vue.extend({
  name: 'Resizer',
  props: {
    controlStyle: {
      type: Object as () => IControlStyle,
      default: () => Object.assign({}, DEFAULT_CONTROL_STYLE),
    },

    /** 是否显示缩放按钮 */
    showResizers: {
      type: Boolean,
      default: true,
    },

    /** 画布缩放大小 */
    canvasScale: Number,

    /** 画布内边距 */
    canvasPadding: Number,
  },
  data () {
    return {
      prefixCls,

      resizerHalfSize,
    }
  },
  methods: {
    /** 处理 Resizer mousedown 事件 */
    handleResizerMouseDown (event: MouseEvent, direction: string) {
      this.$emit('resizer-mousedown', event, direction)
    },
  },
})
</script>
