<template>
  <div :class="prefixCls">
    <div
      v-show="!isNaN(horizontalLine)"
      :class="[
        `${prefixCls}__line`,
        `${prefixCls}__line-horizontal`,
      ]"
      :style="{
        top: `${horizontalLine * canvasScale + canvasPadding}px`,
        width: `${canvasTotalWidth}px`,
      }"
    ></div>
    <div
      v-show="!isNaN(verticalLine)"
      :class="[
        `${prefixCls}__line`,
        `${prefixCls}__line-vertical`,
      ]"
      :style="{
        left: `${verticalLine * canvasScale + canvasPadding}px`,
        height: `${canvasTotalHeight}px`,
      }"
    ></div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { CLASS_PREFIX } from '../const'
import { ICanvasSize } from '../interfaces'

const prefixCls = `${CLASS_PREFIX}-attach-line`

export default Vue.extend({
  name: 'AttachLine',
  props: {
    horizontalLine: {
      type: Number,
      default: 0,
    },

    verticalLine: {
      type: Number,
      default: 0,
    },

    /** 画布缩放大小 */
    canvasScale: Number,

    /** 画布尺寸 */
    canvasSize: Object as () => ICanvasSize,

    /** 画布内边距 */
    canvasPadding: Number,
  },
  data () {
    return {
      prefixCls,
    }
  },
  computed: {
    canvasTotalWidth (): number {
      return this.canvasSize.width + 2 * this.canvasPadding
    },

    canvasTotalHeight (): number {
      return this.canvasSize.height + 2 * this.canvasPadding
    },
  },
})
</script>
