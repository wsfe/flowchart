# ws-flowchart

**0.x 版本为不稳定版本，不推荐在项目中试毒**

[在线 demo](https://wsfe.github.io/flowchart/)

## 安装

暂未发布到 npm 。

## 使用

```javascript
// 引入的是 Vue 组件
import FlowChart from '@wsfe/flowchart'
```

## TODO

- [ ] 单元测试
- [ ] 预留导入流程图元素的接口，且支持分组
- [ ] 手动调用的方法中不应触发事件，例如 `deleteChart`
- [ ] 缩放画布时以鼠标位置为中心点
- [ ] 新增缩放画布到自适应的方法
- [ ] 缩略图导航
- [ ] 按住空格拖动画布
- [ ] 节点内部可触发事件改变节点大小
- [ ] 曲线连线类型

## 约定的概念

在编写代码的时候设计还没完善，有些概念慢慢改变，这边记录下来供参考

1. 流程图上只有两种东西 —— 节点与连线，统称为元素
2. chart: 元素，chart = node | link
3. node: 节点
4. link: 连线
5. 每个节点的实现称为一个 “控件” ，即 control ，因此 node 里有个字段 `controlName` 即是记录这个节点是用的哪个控件
6. anchor: 锚点，有两种，一种是可以拉出连线的锚点，一种是缩放节点用的锚点，位置都是用 0-1 的数字来记录的

## 快捷键

- `Delete` 删除选中元素
- `Ctrl + Z` 撤销
- `Ctrl + Y` 重做
- `Ctrl + A` 全选
- `方向键` 移动选中元素，步长为 10
- `Ctrl + 方向键` 或 `Shift + 方向键` 移动选中元素，步长为 1
- `Space + 鼠标移动` 拖动画布（未实现）
- `鼠标滚轮` 画布缩放（未实现，目前缩放通过修改 `canvasScale` Prop 来实现）

## API

### 类型说明

具体可以看 `src/interfaces`

```typescript
/** 预先定义的控件信息 */
export interface IControl {
  /** 控件名称 */
  controlName: string,
  /** 对应 Vue 组件 */
  component: VueConstructor,
  /** 控件是否在拖拽区域显示 */
  hidden?: boolean,
  /** 控件拥有的锚点列表 */
  anchors?: IControlAnchor[],
  /** 控件标签 */
  label?: string,
  /** 控件默认宽度 */
  defaultWidth?: number,
  /** 控件默认高度 */
  defaultHeight?: number,
  /** 控件最小宽度 */
  minWidth?: number,
  /** 控件最小高度 */
  minHeight?: number,
  /** 控件最大宽度 */
  maxWidth?: number,
  /** 控件最大高度 */
  maxHeight?: number,
  /** 禁止连接自身 */
  disableLinkSelf?: boolean,
  /** 最大输入连线条数 */
  maxLinkIn?: number,
  /** 最大输出连线条数 */
  maxLinkOut?: number,
  /** 在 isEditing 状态改变时拍摄快照，默认 true */
  takeSnapshotOnEditChange?: boolean,
  /** 节点遮罩宽 */
  maskWidth?: number | string,
  /** 节点遮罩高 */
  maskHeight?: number | string,
  /** 节点遮罩 x 方向偏移量 */
  maskOffsetX?: number | string,
  /** 节点遮罩 y 方向偏移量 */
  maskOffsetY?: number | string,
  /** 是否可缩放 */
  resizable: boolean,
}
```

```typescript
/** 节点 */
export interface IFlowChartNode {
  id?: string,
  /** 控件名称 */
  controlName: string,
  /** 节点位置信息 */
  style: Partial<IControlStyle>,
  /** 节点额外数据，在每个控件中可自定义 */
  nodeData?: {
    [key: string]: any,
  },
}

/** 连线 */
export interface IFlowChartLink {
  id?: string,
  /** 连线类型 */
  linkType?: keyof typeof linkTypeEnum,
  /** 折线正交拐点 */
  polylinePoints?: ICanvasCoordinate[],
  /** 起始节点 id */
  startNodeId?: string | null,
  /** 起始锚点 */
  startAnchor?: IControlAnchor,
  /** 如果不是连接节点，则需要提供相对于画布的坐标 */
  startCoordinate?: ICanvasCoordinate,
  /** 终止节点 id */
  endNodeId?: string | null,
  /** 终止锚点 */
  endAnchor?: IControlAnchor,
  /** 如果不是连接节点，则需要提供相对于画布的坐标 */
  endCoordinate?: ICanvasCoordinate,
  /** 连线编辑器位置，0-1 的数字 */
  editorPosition?: number,
  /** 图层顺序 */
  z?: number,
  /** 连线额外数据 */
  linkData?: {
    [key: string]: any,
    /** 连线文字 */
    text: string,
  },
}

/** flowchart 数据格式 */
export interface IFlowChartData {
  nodes: IFlowChartNode[],
  links: IFlowChartLink[],
}
```

### FlowChart API

#### Props

| 属性                 | 说明                     | 类型                                                                                 | 默认值                          |
| :------------------- | :----------------------- | :----------------------------------------------------------------------------------- | :------------------------------ |
| data                 | 流程图数据               | `{ nodes: IFlowChartNode[], links: IFlowChartLink[] }`                               | `{ nodes: [], links: [] }`      |
| controlList          | 控件列表                 | `IControl[]`                                                                         | []                              |
| linkType             | 连线类型                 | `'straight' \| 'bezier' \| 'polyline'`                                               | 'straight'                      |
| linkEditor           | 连线编辑器组件           | `VueConstructor`                                                                     | 无                              |
| linkEditorWidth      | 连线编辑区域宽           | `number`                                                                             | 170                             |
| linkEditorHeight     | 连线编辑区域高           | `number`                                                                             | 70                              |
| allowFreeLink        | 是否允许自由连线         | `boolean`                                                                            | true                            |
| maxSnapshots         | 最大快照数               | `number`                                                                             | 10                              |
| readonly             | 是否只读                 | `boolean`                                                                            | 无                              |
| chartClassNameMethod | 给每个元素上附加的 class | `(chart: FlowChartNode \| FlowChartLink) => object \| Array<object \| string> \| string` | `() => ({})`                    |
| isChartDeletable     | 判断元素是否可被删除     | `(chart: FlowChartNode \| FlowChartLink) => boolean`                                  | `() => true`                    |
| isChartEditable      | 判断元素是否可编辑       | `(chart: FlowChartNode \| FlowChartLink) => boolean`                                  | `() => true`                    |
| canvasScale          | 画布缩放大小，须大于 0   | `number`                                                                             | 1                               |
| canvasSize           | 画布尺寸                 | `{ width: number, height: number }`                                                  | `{ width: 1050, height: 1500 }` |
| canvasPadding        | 画布内边距               | `number`                                                                             | 1000                            |
| linkArrowWidth       | 连线末尾箭头长度         | `number`                                                                             | 11                              |
| linkArrowHeight      | 连线末尾箭头高度         | `number`                                                                             | 10                              |

#### Events

| 事件名       | 说明           | 返回值                                |
| :----------- | :------------- | :------------------------------------ |
| chart-delete | 删除元素时触发 | 被删除元素的 id 数组                  |
| undo-change  | 撤销时触发     | 返回一个 `boolean` 表示后续是否可撤销 |
| redo-change  | 重做时触发     | 返回一个 `boolean` 表示后续是否可重做 |

...事件需要再整理，待补充

#### Methods

| 方法                | 说明                 | 参数                                                                                                                        | 返回值                                  |
| :------------------ | :------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| getFlowChart        | 获取实时的流程图数据 | 无                                                                                                                          | `FlowChartData`                         |
| getSelectedCharts   | 获取选中的元素       | 无                                                                                                                          | `Array<FlowChartNode \| FlowChartLink>` |
| clearSelectedCharts | 清除选中的元素       | 无                                                                                                                          | 无                                      |
| getStartCharts      | 获取起始元素         | 无                                                                                                                          | `FlowChartData`                         |
| addNode             | 添加节点             | `node: IFlowChartNode`: 节点数据<br/>`takeSnapshot: boolean = true`: 是否拍摄快照                                           | 返回新创建的节点                        |
| addLink             | 添加连线             | `link: IFlowChartLink`: 节点数据<br/>`takeSnapshot: boolean = true`: 是否拍摄快照                                           | 返回新创建的连线                        |
| deleteCharts        | 删除节点与连线       | `ids: string[]`: 待删除元素 id<br/>`takeSnapshot: boolean = true`: 是否拍摄快照                                             | 无                                      |
| deleteChart         | 删除单个节点或连线   | `id: string`: 待删除元素 id<br/>`takeSnapshot: boolean = true`: 是否拍摄快照                                                | 无                                      |
| setChartData        | 设置某个元素数据     | `id: string`: 元素 id<br/>`valueObj: { [key: string]: any }`: 待设置的数据<br/>`takeSnapshot: boolean = true`: 是否拍摄快照 | 无                                      |
| deleteChartData     | 删除某个元素数据     | `id: string`: 元素 id<br/>`keys: string[]`: 待删除的数据 key<br/>`takeSnapshot: boolean = true`: 是否拍摄快照               | 无                                      |

### 流程图节点 API

#### 节点能接收到的 Props

| 属性          | 说明             | 类型                     | 默认值         |
| :------------ | :--------------- | :----------------------- | :------------- |
| isEditing     | 是否处于编辑状态 | `boolean`                | false          |
| readonly      | 是否只读         | `boolean`                | 无             |
| flowChartData | 完整流程图数据   | `FlowChartData`          | 默认流程图数据 |
| data          | 节点数据         | `{ [key: string]: any }` | 无             |
| node          | 节点             | `FlowChartNode`          | 无             |
| isThumbnail   | 节点是否是缩略图 | `boolean`                | false          |

#### 节点能触发的事件

| 事件名           | 说明         | 返回值                                                                                                 |
| :--------------- | :----------- | :----------------------------------------------------------------------------------------------------- |
| update-data      | 更新节点数据 | `valueObj: { [key: string]: any }`: 要更新的数据对象<br/>`takeSnapshot: boolean = false`: 是否拍摄快照 |
| delete-data      | 删除节点数据 | `keys: string[]`: 待删除的数据 key<br/>`takeSnapshot: boolean = false`: 是否拍摄快照                   |
| take-snapshot    | 拍摄快照     | 无                                                                                                     |
| replace-snapshot | 替换当前快照 | 无                                                                                                     |

## 如何开发流程图元素

### 单个元素

1. 每个控件是一个 Vue 组件，因此首先创建一个 Vue 组件
2. 根据上述 API 中，节点能接收到的 Props 与节点能触发的事件，来实现节点的功能，比如当 `isEditing` 为 `true` 时进入编辑状态，组件相应改变显示的内容等

### 一组元素

多个元素组成一个数组按要求的格式塞到 `FlowChart` 的 `controlList` 里即可使用

### 多组元素

暂未实现接口

## 存在的问题与矛盾点

1. 想加入旋转，但逻辑没理清楚，又急着投入使用，因此有的方法兼容了旋转，有的地方比较复杂就按没有旋转来实现
2. 吸附对齐功能，在 resize 节点的时候，中点的计算是 `x + width / 2` ，所以会有 0.5px 的情况导致对不齐
3. 涉及坐标的地方基本都用了 `Math.trunc` 方法取整，因为是中途加上的，没有考虑是否有隐藏问题
4. 每个节点的锚点，一开始设想是不限位置与个数的，但是写到这里已经按照固定上下左右 4 个来做了，有些方法也是写死了，如果写控件的时候把锚点写在内部或者四个角落，是会出问题的
