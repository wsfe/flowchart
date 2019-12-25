import { FlowChartLink, FlowChartData } from '../../store';
import { ICanvasCoordinate } from '../../interfaces';
/** 获取连线点坐标 */
declare const getConnectionPoints: (link: FlowChartLink, flowChartData: FlowChartData) => ICanvasCoordinate[];
export { getConnectionPoints, };
