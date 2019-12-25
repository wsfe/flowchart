import { FlowChartNode, FlowChartLink, FlowChartData } from '../../store';
import { ICanvasCoordinate } from '../../interfaces';
import FlowChartSet from '../../utils/set';
interface IUseSelectAreaParams {
    $refs: {
        canvas: HTMLDivElement;
        background: HTMLDivElement;
    };
    flowChartData: FlowChartData;
    isSelectingArea: boolean;
    selectedChartSet: FlowChartSet<FlowChartNode | FlowChartLink>;
    selectingAreaStart: ICanvasCoordinate;
    selectingAreaEnd: ICanvasCoordinate;
    getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate;
    $emit: Function;
}
/** 处理选择区域 */
export default function useSelectArea(context: IUseSelectAreaParams): {
    onBackgroundMouseDown: (event: MouseEvent) => void;
    onBackgroundMouseMove: (event: MouseEvent) => void;
    onBackgroundMouseUp: (event: MouseEvent) => void;
    onNodeMouseDown: (node: FlowChartNode, event: MouseEvent) => void;
    onNodeCtrlMouseDown: (node: FlowChartNode, event: MouseEvent) => void;
    onLinkMouseDown: (link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => void;
    onLinkCtrlMouseDown: (link: FlowChartLink, event: MouseEvent) => void;
};
export {};
