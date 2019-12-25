<template>
  <div :class="prefixCls">
    <template v-for="(control, index) in controlList">
      <div
        v-if="!control.hidden"
        :key="index"
        :class="`${prefixCls}__control`"
      >
        <Node
          :class="`${prefixCls}__control-node`"
          :flowChartData="{}"
          :node="nodes[index]"
          :readonly="true"
          :isThumbnail="true"
          v-on="$listeners"
        />
        <div :class="`${prefixCls}__control-label`">
          <span>{{ control.label }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Node from './Node.vue'
import { CLASS_PREFIX, DEFAULT_CONTROL_STYLE } from '../const'
import { IControl } from '../interfaces'
import { FlowChartNode } from '../store'

const prefixCls = `${CLASS_PREFIX}-drag-zone`

export default Vue.extend({
  name: 'DragZone',
  components: {
    Node,
  },
  props: {
    controlList: {
      type: Array as () => IControl[],
      default: () => [],
    },
  },
  data () {
    return {
      prefixCls,

      nodes: [] as FlowChartNode[],
    }
  },
  watch: {
    controlList: {
      immediate: true,
      handler () {
        this.nodes = []
        this.controlList.forEach((control) => {
          this.nodes.push(new FlowChartNode({
            controlName: control.controlName,
            style: Object.assign({}, DEFAULT_CONTROL_STYLE),
          }))
        })
      },
    },
  },
})
</script>
