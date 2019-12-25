import Vue from 'vue';
import { FlowChartData, FlowChartNode, FlowChartLink } from '../../store';
import { ICanvasArea, ICanvasCoordinate, ICanvasSize } from '../../interfaces';
import FlowChartSet from '../../utils/set';
interface IUseAttachLineParams {
    flowChartData: FlowChartData;
    isCreatingNode: boolean;
    createNode: FlowChartNode;
    isMovingChart: boolean;
    selectedChartSet: FlowChartSet<FlowChartNode | FlowChartLink>;
    attachLine: {
        horizontal: number;
        vertical: number;
    };
    $watch: Vue['$watch'];
}
interface IShouldAttachFunctionReturnType {
    attach: boolean;
    offset: ICanvasCoordinate;
    isHorizontalCenterAttached: boolean;
    isVerticalCenterAttached: boolean;
}
/** 处理吸附直线 */
export default function useAttachLine(context: IUseAttachLineParams): {
    updateCreatingNodePossibleLines: () => void;
    updateCreateNodeControlAndSize: (controlName: string, size: ICanvasSize) => void;
    updateCreateNodePosition: (position: ICanvasCoordinate) => void;
    updateMovingNodePossibleLines: () => void;
    clearAttachLine: () => void;
    shouldAttach: (movingArea: ICanvasArea) => IShouldAttachFunctionReturnType;
};
export {};
