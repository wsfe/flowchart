import { FlowChartLink } from '../store';
import { ICanvasCoordinate } from '../interfaces';
interface IUseMovePolylineParams {
    getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate;
    $emit: Function;
}
/** 处理移动折线 */
export default function useMovePolyline(context: IUseMovePolylineParams): {
    onBackgroundMouseMove: (event: MouseEvent) => void;
    onBackgroundMouseUp: (event: MouseEvent) => void;
    onLinkMouseDown: (link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => void;
};
export {};
