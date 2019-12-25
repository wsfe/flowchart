import { FlowChartLink, FlowChartData, FlowChartNode } from '../../store';
import { ICanvasCoordinate, IControlAnchor } from '../../interfaces';
interface IUseMoveLinkAnchorParams {
    flowChartData: FlowChartData;
    allowFreeLink: boolean;
    isMovingLinkAnchor: boolean;
    moveLinkAnchor: FlowChartLink | null;
    getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate;
    $emit: Function;
}
/** 处理移动连线锚点 */
export default function useMoveLinkAnchor(context: IUseMoveLinkAnchorParams): {
    onBackgroundMouseMove: (event: MouseEvent) => void;
    onBackgroundMouseUp: (event: MouseEvent) => void;
    onNodeMouseMove: (node: FlowChartNode, event: MouseEvent, anchor: IControlAnchor) => void;
    onAnchorMouseMove: (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => void;
    onAnchorMouseUp: (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => void;
    onLinkStartAnchorMouseDown: (link: FlowChartLink, event: MouseEvent) => void;
    onLinkEndAnchorMouseDown: (link: FlowChartLink, event: MouseEvent) => void;
};
export {};
