import { FlowChartNode, FlowChartLink } from '../../store';
import { ICanvasCoordinate } from '../../interfaces';
import FlowChartSet from '../../utils/set';
import { useAttachLine } from './index';
/** 缩放点坐标 key */
declare type ResizerAnchorKeyType = '00' | '10' | '01' | '11';
interface IUseResizeNodeParams {
    isResizingNode: boolean;
    selectedChartSet: FlowChartSet<FlowChartNode | FlowChartLink>;
    getMouseCoordinate: (event: MouseEvent) => ICanvasCoordinate;
    $emit: Function;
}
/** 处理缩放节点 */
export default function useResizeNode(context: IUseResizeNodeParams, attachLineContext: ReturnType<typeof useAttachLine>): {
    onBackgroundMouseMove: (event: MouseEvent) => void;
    onBackgroundMouseUp: (event: MouseEvent) => void;
    onResizerMouseDown: (event: MouseEvent, direction: ResizerAnchorKeyType) => void;
};
export {};
