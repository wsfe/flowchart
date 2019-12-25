import { ICanvasCoordinate } from '../interfaces';
import { FlowChartNode, FlowChartLink } from '../store';
interface IUseMoveChartParams {
    $refs: {
        canvas: HTMLDivElement;
    };
    canvasScale: number;
    moveSelectedCharts: (offset: ICanvasCoordinate) => void;
    $emit: Function;
}
/** 处理移动元素 */
export default function useMoveChart(context: IUseMoveChartParams): {
    onBackgroundMouseMove: (event: MouseEvent) => void;
    onBackgroundMouseUp: (event: MouseEvent) => void;
    onNodeMouseDown: (node: FlowChartNode, event: MouseEvent) => void;
    onLinkMouseDown: (link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => void;
};
export {};
