import { IFlowChartData, IFlowChartNode, IFlowChartLink, IControlMap } from '../interfaces';
import { FlowChartNode, FlowChartLink } from './index';
export declare class FlowChartData {
    nodes: FlowChartNode[];
    links: FlowChartLink[];
    constructor(options: IFlowChartData, controlMap: IControlMap);
    /** 更新控件 map */
    updateControlMap(controlMap: IControlMap): void;
    /** 清空元素 */
    clearCharts(): void;
    /** 更新 FlowChartLink 记录节点 */
    updateNodesRecord(): void;
    /** 获取所有元素 */
    getCharts(): (FlowChartLink | FlowChartNode)[];
    /**
     * 获取流程图的起点元素
     */
    getStartCharts(): {
        nodes: FlowChartNode[];
        links: FlowChartLink[];
    };
    /** 新增节点 */
    addNode(nodeOption: IFlowChartNode): FlowChartNode;
    /** 新增连线 */
    addLink(linkOption: IFlowChartLink): FlowChartLink;
    /**
     * 删除元素
     * @param id 要删除的元素 id
     * @param isChartDeletable 判断元素是否可删除的函数
     * @returns 返回被删除的元素，没有找到则返回 null
     */
    deleteChart(id: string, isChartDeletable: (chart: FlowChartNode | FlowChartLink) => boolean): FlowChartNode | FlowChartLink | null;
    deleteCharts(ids: string[], isChartDeletable: (chart: FlowChartNode | FlowChartLink) => boolean): Array<FlowChartNode | FlowChartLink>;
    setChartData(id: string, valueObj: {
        [key: string]: any;
    }): boolean;
    deleteChartData(id: string, keys: string[]): boolean;
    /**
     * 根据 id 查找元素
     * @param id id
     */
    findChartById(id: string): FlowChartLink | FlowChartNode | null;
    /**
     * 获取当前最大 z-index 值
     */
    getMaxZ(): number;
    set nodes_(value: FlowChartNode[]);
}
