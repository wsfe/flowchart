<template>
  <div class="app-container">
    <div class="inner-container">
      <FlowChart
        :controlList="controlList"
        :canvasScale="canvasScale"
        :linkType="linkType"
      >
        <div
          slot="top-bar"
          class="bar"
        >
          <span>
            连线类型：
            <select v-model="linkType">
              <option value="polyline">折线</option>
              <option value="straight">直线</option>
            </select>
          </span>
        </div>
        <div
          slot="bottom-bar"
          class="bar"
        >
          <button>测试底部栏</button>
        </div>
      </FlowChart>
    </div>
  </div>
</template>

<script>
import FlowChart from '../src'
import FlowInput from './elements/FlowInput'

export default {
  name: 'App',
  components: {
    FlowChart,
  },
  data () {
    return {
      linkType: 'polyline',

      canvasScale: 1,

      controlList: [
        {
          controlName: 'FlowInput',
          component: FlowInput,
          label: '输入框',
          disableLinkSelf: true,
          defaultWidth: 200,
          defaultHeight: 100,
        }
      ]
    }
  },
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}
html, body {
  width: 100%;
  height: 100%;
}
.app-container {
  width: 80%;
  height: 400px;
  position: relative;
  top: 100px;
  margin: 0 auto;
  border: 8px solid pink;
  overflow: auto;
  /* margin-top: 10px;
  padding-top: 10px; */
}
.inner-container {
  width: 100%;
  height: 600px;
}
.bar {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 10px;
}
</style>
