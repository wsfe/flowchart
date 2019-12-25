import Vue, { VueConstructor } from 'vue';
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store';
import { linkTypeEnum } from '../const';
import { ICanvasSize, ICanvasArea, IControlAnchor, ICanvasCoordinate } from '../interfaces';
import FlowChartSet from '../utils/set';
declare const _default: import("vue/types/vue").ExtendedVue<Vue & {
    $refs: {
        canvas: HTMLDivElement;
        background: HTMLDivElement;
    };
}, {
    prefixCls: string;
    linkPrefixCls: string;
    /** 选中的节点与连线集合 */
    selectedChartSet: FlowChartSet<FlowChartLink | FlowChartNode>;
    /** 是否正在选择一个区域 */
    isSelectingArea: boolean;
    /** 选择区域起点记录 */
    selectingAreaStart: ICanvasCoordinate;
    /** 选择区域终点记录 */
    selectingAreaEnd: ICanvasCoordinate;
    /** 是否显示成组元素 */
    isGroupShow: boolean;
    mouseMoveNodeId: string | null;
    /** 是否正在移动元素 */
    isMovingChart: boolean;
    /** 是否正在缩放节点 */
    isResizingNode: boolean;
    /** 是否正在移动连线锚点 */
    isMovingLinkAnchor: boolean;
    /** 正在移动锚点中的连线 */
    moveLinkAnchor: FlowChartLink | null;
    /** 是否正在创建连线 */
    isCreatingLink: boolean;
    createLink: FlowChartLink;
    createNode: FlowChartNode;
    attachLine: {
        horizontal: number;
        vertical: number;
    };
    eventHandlers: {
        onBackgroundMouseDown: ((event: MouseEvent) => void)[];
        onBackgroundMouseMove: ((event: MouseEvent) => void)[];
        onBackgroundMouseUp: ((event: MouseEvent) => void)[];
        onNodeMouseDown: ((node: FlowChartNode, event: MouseEvent) => void)[];
        onNodeCtrlMouseDown: ((node: FlowChartNode, event: MouseEvent) => void)[];
        onNodeMouseMove: ((node: FlowChartNode, event: MouseEvent, anchor: IControlAnchor) => void)[];
        onAnchorMouseDown: ((node: FlowChartNode, anchor: IControlAnchor) => void)[];
        onAnchorMouseMove: ((node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => void)[];
        onAnchorMouseUp: ((node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent) => void)[];
        onResizerMouseDown: ((event: MouseEvent, direction: "00" | "10" | "01" | "11") => void)[];
        onLinkMouseDown: ((link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => void)[];
        onLinkCtrlMouseDown: ((link: FlowChartLink, event: MouseEvent) => void)[];
        onLinkStartAnchorMouseDown: ((link: FlowChartLink, event: MouseEvent) => void)[];
        onLinkEndAnchorMouseDown: ((link: FlowChartLink, event: MouseEvent) => void)[];
    };
}, {
    /** 设置选中的元素 */
    selectChart(id: string, clear?: boolean): void;
    /** 取消选中元素 */
    unselectChart(id: string): void;
    /** 移动选中的元素 */
    moveSelectedCharts(offset: ICanvasCoordinate): void;
    /** 移动画布 */
    moveCanvas(offset: ICanvasCoordinate): void;
    /** 创建连线 */
    createNewLink(): void;
    /** 获取鼠标相对于画布的坐标位置信息 */
    getMouseCoordinate(event: MouseEvent): ICanvasCoordinate;
    /** 获取最近的锚点 */
    getNearestAnchor(mouseCoordinate: ICanvasCoordinate, node: FlowChartNode): IControlAnchor;
    /** 根据 id 判断连线是否被选中 */
    isLinkSelected(link: FlowChartLink): boolean;
    /** 根据 id 判断节点是否被选中 */
    isNodeSelected(node: FlowChartNode): boolean;
    /** 判断鼠标是否经过此节点 */
    isMouseMoveNode(node: FlowChartNode): boolean;
    handleBackgroundMouseDown(event: MouseEvent): void;
    handleBackgroundMouseMove(event: MouseEvent): void;
    handleBackgroundMouseUp(event: MouseEvent): void;
    handleNodeMouseDown(node: FlowChartNode, event: MouseEvent): void;
    handleNodeCtrlMouseDown(node: FlowChartNode, event: MouseEvent): void;
    handleNodeMouseMove(node: FlowChartNode, event: MouseEvent): void;
    handleNodeMouseMoveOutside(node: FlowChartNode): void;
    handleAnchorMouseDown(node: FlowChartNode, anchor: IControlAnchor): void;
    handleAnchorMouseMove(node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent): void;
    handleAnchorMouseUp(node: FlowChartNode, anchor: IControlAnchor, event: MouseEvent): void;
    /** TODO: 更新节点坐标，在 resize 与 rotate 后执行，中心点不变，改变 x, y */
    handleResizerMouseDown(event: MouseEvent, direction: "00" | "10" | "01" | "11"): void;
    handleLinkMouseDown(link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number): void;
    handleLinkCtrlMouseDown(link: FlowChartLink, event: MouseEvent): void;
    handleLinkStartAnchorMouseDown(link: FlowChartLink, event: MouseEvent): void;
    handleLinkEndAnchorMouseDown(link: FlowChartLink, event: MouseEvent): void;
    handleLinkTextChange(link: FlowChartLink, text: string): void;
}, {
    tailZStyle: object;
    selectingAreaStyle: object;
    resizerArea: ICanvasArea;
    showResizers: boolean;
    shouldResizerFrameShow: boolean;
}, {
    flowChartData: FlowChartData;
    isCreatingNode: boolean;
    isMouseInsideCanvas: boolean;
    flowChartCreateNode: FlowChartNode;
    linkType: linkTypeEnum;
    linkEditor: VueConstructor<Vue>;
    linkEditorWidth: number;
    linkEditorHeight: number;
    allowFreeLink: boolean;
    chartClassNameMethod: (chart: FlowChartLink | FlowChartNode) => string | object | (string | object)[];
    isChartEditable: (chart: FlowChartLink | FlowChartNode) => boolean;
    canvasScale: number;
    canvasSize: ICanvasSize;
    canvasPadding: number;
    linkArrowWidth: number;
    linkArrowHeight: number;
    readonly: boolean;
    provideChartProps: unknown;
}>;
export default _default;
