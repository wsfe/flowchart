import { ICanvasCoordinate } from '../interfaces';
import { FlowChartData, FlowChartLink } from '../store';
/**
 * 根据两个点获取终止点处对应箭头的三个点
 * @param c1 起始点
 * @param c2 终止点
 * @param arrowWidth 箭头长
 * @param arrowHeight 箭头高
 */
export declare const getArrowPoints: (c1: ICanvasCoordinate, c2: ICanvasCoordinate, arrowWidth: number, arrowHeight: number) => ICanvasCoordinate[];
/**
 * 连线操作是否合法，例如是否允许创建、移动连线
 * @param link 要操作的连线
 * @param data 流程图数据
 */
export declare const isLinkOperationValid: (link: FlowChartLink, data: FlowChartData) => boolean;
