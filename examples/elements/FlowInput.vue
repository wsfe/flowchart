<template>
  <div class="container">
    <input
      ref="input"
      type="text"
      :placeholder="isThumbnail ? '' : '双击在节点中输入内容'"
    />
    <div v-if="!isThumbnail">
      处于编辑状态：{{ isEditing }}<br/>
      连接的节点数：{{ linkedNodeCount }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlowInput',
  props: {
    isThumbnail: Boolean,

    isEditing: Boolean,

    node: Object,

    flowChartData: Object,
  },
  computed: {
    linkedNodeCount () {
      return this.flowChartData.links.filter((link) => link.startNodeId === this.node.id && link.endNodeId).length
    },
  },
  watch: {
    isEditing (val) {
      if (val) {
        this.$refs.input.focus()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.container {
  border-radius: 5px;
  // 不设置 overflow 可让节点内的内容溢出，但是不在编辑状态的时候也能点到溢出部分，因为遮罩大小不会变
  overflow: hidden;
  border: 1px solid #C6C6C6;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: lightyellow;
}
</style>
