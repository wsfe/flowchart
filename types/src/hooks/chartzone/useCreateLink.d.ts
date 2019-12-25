import { FlowChartLink, FlowChartNode } from '../../store';
import { ICanvasCoordinate, IControlAnchor } from '../../interfaces';
interface IUseCreateLinkParams {
    isCreatingLink: boolean;
    createLink: FlowChartLink;
    createNewLink: () => void;
    getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate;
    $emit: Function;
}
/** 处理创建连线 */
export default function useCreateLink(context: IUseCreateLinkParams): {
    onBackgroundMouseMove: (event: MouseEvent) => void;
    onBackgroundMouseUp: (event: MouseEvent) => void;
    onNodeMouseMove: (node: FlowChartNode, event: MouseEvent, anchor: IControlAnchor) => void;
    onAnchorMouseDown: (node: FlowChartNode, anchor: IControlAnchor) => void;
    onAnchorMouseMove: (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => void;
    onAnchorMouseUp: (node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => void;
};
export {};
