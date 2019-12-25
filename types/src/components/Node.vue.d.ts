import Vue from 'vue';
import { FlowChartData, FlowChartNode } from '../store';
declare const _default: import("vue/types/vue").ExtendedVue<Vue & {
    $refs: {
        container: HTMLDivElement;
    };
}, {
    prefixCls: string;
    /** 是否为编辑状态 */
    isEditing: boolean;
    /** 节点数据缓存 */
    nodeDataCache: {
        [key: string]: any;
    };
}, {
    handleKeyDown(event: KeyboardEvent): void;
    handleUpdateNodeData(valueObj: {
        [key: string]: any;
    }, takeSnapshot?: boolean): void;
    handleDeleteNodeData(keys: string[], takeSnapshot?: boolean): void;
    handleTakeSnapshot(): void;
    handleReplaceSnapshot(): void;
    /** 点击了节点外面则停止编辑 */
    handleClickOutside(event: MouseEvent): void;
    /** 处理点中遮罩，即选中节点 */
    handleMaskMouseDown(event: MouseEvent): void;
    /** 处理按下 Ctrl 键后的 mousedown 事件，用于成组选中 */
    handleMaskCtrlMouseDown(event: MouseEvent): void;
    /** 处理 mousemove */
    handleMouseMove(event: MouseEvent): void;
    /** 处理 mouseup */
    handleMouseUp(event: MouseEvent): void;
    /** 处理双击遮罩，即进入编辑状态 */
    handleMaskDblClick(): void;
}, {
    maskStyle: object;
    containerSize: object;
}, {
    node: FlowChartNode;
    flowChartData: FlowChartData;
    injectProps: unknown;
    isSelected: boolean;
    isGroupSelected: boolean;
    isChartEditable: (chart: FlowChartNode) => boolean;
    isThumbnail: boolean;
    readonly: boolean;
    canvasScale: number;
    canvasPadding: number;
    rotatable: boolean;
}>;
export default _default;
