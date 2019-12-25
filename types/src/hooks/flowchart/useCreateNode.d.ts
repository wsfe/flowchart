import { FlowChartNode } from '../../store';
import { IFlowChartNode } from '../../interfaces';
import { useAttachLine } from '../chartzone';
interface IUseCreateNodeParams {
    $refs: {
        flowchart: HTMLDivElement;
        chartzone: {
            $refs: {
                background: HTMLDivElement;
                canvas: HTMLDivElement;
            };
            selectChart: Function;
        };
    };
    canvasScale: number;
    canvasPadding: number;
    isCreatingNode: boolean;
    isCreateNodeShow: boolean;
    createNode: FlowChartNode;
    isMouseInsideCanvas: boolean;
    addNode: (node: IFlowChartNode, takeSnapshot?: boolean) => FlowChartNode;
    $nextTick: Function;
}
/** 处理新建节点 */
export default function useCreateNode(context: IUseCreateNodeParams, attachLineContext: ReturnType<typeof useAttachLine>): {
    onDragZoneNodeMouseDown: (node: FlowChartNode, event: MouseEvent) => void;
    onFlowChartMouseMove: (event: MouseEvent) => void;
    onDocumentMouseUp: (event: MouseEvent) => void;
};
export {};
