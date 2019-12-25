import { ICanvasCoordinate } from '../../interfaces';
import { FlowChartNode, FlowChartLink } from '../../store';
import FlowChartSet from '../../utils/set';
import { useAttachLine } from './index';
interface IUseMoveChartParams {
    $refs: {
        canvas: HTMLDivElement;
    };
    isMovingChart: boolean;
    canvasScale: number;
    selectedChartSet: FlowChartSet<FlowChartNode | FlowChartLink>;
    moveSelectedCharts: (offset: ICanvasCoordinate) => void;
    $emit: Function;
}
/** 处理移动元素 */
export default function useMoveChart(context: IUseMoveChartParams, attachLineContext: ReturnType<typeof useAttachLine>): {
    onBackgroundMouseMove: (event: MouseEvent) => void;
    onBackgroundMouseUp: (event: MouseEvent) => void;
    onNodeMouseDown: (node: FlowChartNode, event: MouseEvent) => void;
    onLinkMouseDown: (link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => void;
};
export {};
