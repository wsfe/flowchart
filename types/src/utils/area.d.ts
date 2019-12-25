import { ICanvasArea, ICanvasCoordinate } from '../interfaces';
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store';
/**
 * 根据点坐标获取区域
 * @param points 点
 */
export declare const getArea: (points: ICanvasCoordinate[]) => ICanvasArea;
/**
 * 根据元素获取元素所组成的区域
 * @param charts 元素
 * @param nodes 所有节点
 */
export declare const getAreaByCharts: (charts: (FlowChartLink | FlowChartNode)[]) => ICanvasArea;
/**
 * 判断区域 area1 是否在区域 area2 内
 * @param area1 区域1，被包含区域
 * @param area2 区域2，更大范围的区域
 */
export declare const isInsideArea: (area1: ICanvasArea, area2: ICanvasArea) => boolean;
/**
 * 判断节点是否在一个区域内
 * @param node 节点
 * @param area 区域，包含 width, height, x, y 信息
 */
export declare const isNodeInsideArea: (node: FlowChartNode, area: ICanvasArea) => boolean;
/**
 * 判断连线是否在一个区域内
 * @param link 连线
 * @param area 区域，包含 width, height, x, y 信息
 * @param nodes 所有节点
 */
export declare const isLinkInsideArea: (link: FlowChartLink, area: ICanvasArea) => boolean;
/**
 * 获取区域范围内的节点与连线
 * @param area 区域
 * @param flowChartData 元素数据
 */
export declare const getChartsInsideArea: (area: ICanvasArea, flowChartData: FlowChartData) => (FlowChartLink | FlowChartNode)[];
