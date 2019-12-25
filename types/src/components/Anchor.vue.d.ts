import Vue from 'vue';
import { IControlAnchor } from '../interfaces';
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store';
declare const _default: import("vue/types/vue").ExtendedVue<Vue, {
    prefixCls: string;
}, {
    getAnchorStyle(anchor: IControlAnchor): {
        top: string;
        left: string;
    };
    /**
     * 获取锚点相对于节点的位置
     * @param anchor 锚点位置信息
     */
    getAnchorPosition(anchor: IControlAnchor): {
        top: number;
        left: number;
    };
    /** 锚点是否不允许连线 */
    isAnchorNotAllowed(anchor: IControlAnchor): boolean;
    /** 锚点是否将被连接 */
    isAnchorToBeLinked(anchor: IControlAnchor): boolean;
    /** 处理锚点 mousedown 事件 */
    handleAnchorMouseDown(anchor: IControlAnchor): void;
    /** 处理锚点 mouseup 事件 */
    handleAnchorMouseUp(anchor: IControlAnchor, event: MouseEvent): void;
    handleAnchorMouseMove(anchor: IControlAnchor, event: MouseEvent): void;
}, unknown, {
    node: FlowChartNode;
    flowChartData: FlowChartData;
    isCreatingLink: boolean;
    createLink: {
        startNodeId: string | null;
        startAnchor: {
            x: number;
            y: number;
        };
        startCoordinate: {
            x: number;
            y: number;
        };
        endNodeId: string | null;
        endAnchor: {
            x: number;
            y: number;
        };
        endCoordinate: {
            x: number;
            y: number;
        };
    };
    isMovingLinkAnchor: boolean;
    moveLinkAnchor: FlowChartLink | null;
    isSelected: boolean;
    readonly: boolean;
    canvasScale: number;
    canvasPadding: number;
}>;
export default _default;
