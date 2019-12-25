import { IFlowChartData, IFlowChartNode, IFlowChartLink, IControlMap } from '../interfaces'
import { FlowChartNode, FlowChartLink } from './index'
import { updateControlMap } from './control-map'

export class FlowChartData {
  nodes: FlowChartNode[] = []

  links: FlowChartLink[] = []

  constructor (options: IFlowChartData, controlMap: IControlMap) {
    this.updateControlMap(controlMap)
    this.nodes_ = options.nodes.map((nodeOption) => new FlowChartNode(nodeOption))
    this.links = options.links.map((linkOption) => new FlowChartLink(linkOption))
  }

  /** 更新控件 map */
  updateControlMap (controlMap: IControlMap) {
    updateControlMap(controlMap)
  }

  /** 清空元素 */
  clearCharts () {
    this.nodes_ = []
    this.links = []
  }

  /** 更新 FlowChartLink 记录节点 */
  updateNodesRecord () {
    FlowChartLink.nodes = this.nodes
  }

  // #region 获取信息相关方法

  /** 获取所有元素 */
  getCharts () {
    return [
      ...this.nodes,
      ...this.links,
    ]
  }

  /**
   * 获取流程图的起点元素
   */
  getStartCharts () {
    return {
      // 没有被连线结尾指向的则是一个起始节点
      nodes: this.nodes.filter((node) => {
        return !this.links.some((link) => link.endNodeId === node.id)
      }),
      // start 不是连着一个节点的则是一条起始连线
      links: this.links.filter((link) => {
        return !link.startNodeId
      }),
    }
  }

  // #endregion 获取信息相关方法

  // #region 元素增删改相关方法

  /** 新增节点 */
  addNode (nodeOption: IFlowChartNode): FlowChartNode {
    nodeOption.style = Object.assign({}, { z: this.getMaxZ() + 1 }, nodeOption.style)
    const node = new FlowChartNode(nodeOption)
    this.nodes.push(node)
    return node
  }

  /** 新增连线 */
  addLink (linkOption: IFlowChartLink): FlowChartLink {
    linkOption.z = typeof linkOption.z === 'number' ? linkOption.z : this.getMaxZ() + 1
    const link = new FlowChartLink(linkOption)
    this.links.push(link)
    return link
  }

  /**
   * 删除元素
   * @param id 要删除的元素 id
   * @param isChartDeletable 判断元素是否可删除的函数
   * @returns 返回被删除的元素，没有找到则返回 null
   */
  deleteChart (id: string, isChartDeletable: (chart: FlowChartNode | FlowChartLink) => boolean): FlowChartNode | FlowChartLink | null {
    const nodeIndex = this.nodes.findIndex((node) => node.id === id)
    if (nodeIndex > -1) {
      const node = this.nodes[nodeIndex]
      if (!isChartDeletable(node)) return null
      // 如果有连线在节点上，则将连线变换为自由坐标
      this.links.forEach((link) => {
        if (link.startNodeId === node.id) {
          link.startNodeId = null
          link.startCoordinate = node.getAnchorCoordinate(link.startAnchor)
        }
        if (link.endNodeId === node.id) {
          link.endNodeId = null
          link.endCoordinate = node.getAnchorCoordinate(link.endAnchor)
        }
      })
      this.nodes.splice(nodeIndex, 1)
      return node
    } else {
      const linkIndex = this.links.findIndex((link) => link.id === id)
      if (linkIndex > -1) {
        const link = this.links[linkIndex]
        if (!isChartDeletable(link)) return null
        this.links.splice(linkIndex, 1)
        return link
      }
    }

    return null
  }

  deleteCharts (ids: string[], isChartDeletable: (chart: FlowChartNode | FlowChartLink) => boolean): Array<FlowChartNode | FlowChartLink> {
    const result: Array<FlowChartNode | FlowChartLink> = []
    ids.forEach((id) => {
      const chart = this.deleteChart(id, isChartDeletable)
      if (chart) {
        result.push(chart)
      }
    })
    return result
  }

  setChartData (id: string, valueObj: { [key: string]: any }): boolean {
    const chart = this.findChartById(id)
    if (!chart) return false
    return chart.setData(valueObj)
  }

  deleteChartData (id: string, keys: string[]): boolean {
    const chart = this.findChartById(id)
    if (!chart) return false
    return chart.deleteData(keys)
  }

  // #endregion 元素增删改相关方法


  // #region Utils

  /**
   * 根据 id 查找元素
   * @param id id
   */
  findChartById (id: string): FlowChartLink | FlowChartNode | null {
    const charts: Array<FlowChartNode | FlowChartLink> = [
      ...this.nodes,
      ...this.links,
    ]
    const chart = charts.find((c) => c.id === id)
    return chart || null
  }

  /**
   * 获取当前最大 z-index 值
   */
  getMaxZ (): number {
    if (!this.nodes.length && !this.links.length) return -1
    return Math.max(
      ...this.nodes.map((node) => node.z),
      ...this.links.map((link) => link.z),
    )
  }

  // #endregion Utils

  // #region Setters

  set nodes_ (value: FlowChartNode[]) {
    this.nodes = value
    this.updateNodesRecord()
  }

  // #endregion Setters
}
