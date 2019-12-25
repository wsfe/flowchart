import Vue, { VueConstructor } from 'vue';
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store';
import { linkTypeEnum } from '../const';
import { IControl, IFlowChartNode, IFlowChartData, ICanvasSize, IFlowChartLink, IControlMap } from '../interfaces';
declare const _default: import("vue/types/vue").ExtendedVue<Vue & {
    $refs: {
        flowchart: HTMLDivElement;
        chartzone: import("vue/types/vue").CombinedVueInstance<{
            prefixCls: string;
            linkPrefixCls: string;
            selectedChartSet: import("../utils/set").default<FlowChartLink | FlowChartNode>;
            /** 是否显示创建节点 */
            isSelectingArea: boolean;
            selectingAreaStart: import("../interfaces").ICanvasCoordinate;
            selectingAreaEnd: import("../interfaces").ICanvasCoordinate;
            isGroupShow: boolean;
            mouseMoveNodeId: string | null;
            isMovingChart: boolean;
            isResizingNode: boolean;
            isMovingLinkAnchor: boolean;
            moveLinkAnchor: FlowChartLink | null;
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
                onNodeMouseMove: ((node: FlowChartNode, event: MouseEvent, anchor: import("../interfaces").IControlAnchor) => void)[];
                onAnchorMouseDown: ((node: FlowChartNode, anchor: import("../interfaces").IControlAnchor) => void)[];
                onAnchorMouseMove: ((node: FlowChartNode, anchor: import("../interfaces").IControlAnchor, event: MouseEvent) => void)[];
                onAnchorMouseUp: ((node: FlowChartNode, anchor: import("../interfaces").IControlAnchor, event: MouseEvent) => void)[];
                onResizerMouseDown: ((event: MouseEvent, direction: "00" | "10" | "01" | "11") => void)[];
                onLinkMouseDown: ((link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number) => void)[];
                onLinkCtrlMouseDown: ((link: FlowChartLink, event: MouseEvent) => void)[];
                onLinkStartAnchorMouseDown: ((link: FlowChartLink, event: MouseEvent) => void)[];
                onLinkEndAnchorMouseDown: ((link: FlowChartLink, event: MouseEvent) => void)[];
            };
        } & {
            selectChart(id: string, clear?: boolean): void;
            unselectChart(id: string): void;
            moveSelectedCharts(offset: import("../interfaces").ICanvasCoordinate): void;
            /** 使用当前的数据替换最新的快照 */
            moveCanvas(offset: import("../interfaces").ICanvasCoordinate): void;
            createNewLink(): void;
            getMouseCoordinate(event: MouseEvent): import("../interfaces").ICanvasCoordinate;
            getNearestAnchor(mouseCoordinate: import("../interfaces").ICanvasCoordinate, node: FlowChartNode): import("../interfaces").IControlAnchor;
            isLinkSelected(link: FlowChartLink): boolean;
            isNodeSelected(node: FlowChartNode): boolean;
            isMouseMoveNode(node: FlowChartNode): boolean;
            handleBackgroundMouseDown(event: MouseEvent): void;
            handleBackgroundMouseMove(event: MouseEvent): void;
            handleBackgroundMouseUp(event: MouseEvent): void;
            handleNodeMouseDown(node: FlowChartNode, event: MouseEvent): void;
            handleNodeCtrlMouseDown(node: FlowChartNode, event: MouseEvent): void;
            handleNodeMouseMove(node: FlowChartNode, event: MouseEvent): void;
            handleNodeMouseMoveOutside(node: FlowChartNode): void;
            handleAnchorMouseDown(node: FlowChartNode, anchor: import("../interfaces").IControlAnchor): void;
            handleAnchorMouseMove(node: FlowChartNode, anchor: import("../interfaces").IControlAnchor, event: MouseEvent): void;
            handleAnchorMouseUp(node: FlowChartNode, anchor: import("../interfaces").IControlAnchor, event: MouseEvent): void;
            handleResizerMouseDown(event: MouseEvent, direction: "00" | "10" | "01" | "11"): void;
            handleLinkMouseDown(link: FlowChartLink, event: MouseEvent, isPolyline: boolean, polylineIndex: number): void;
            handleLinkCtrlMouseDown(link: FlowChartLink, event: MouseEvent): void;
            handleLinkStartAnchorMouseDown(link: FlowChartLink, event: MouseEvent): void;
            handleLinkEndAnchorMouseDown(link: FlowChartLink, event: MouseEvent): void;
            handleLinkTextChange(link: FlowChartLink, text: string): void;
        } & {
            tailZStyle: object;
            selectingAreaStyle: object;
            resizerArea: import("../interfaces").ICanvasArea;
            showResizers: boolean;
            shouldResizerFrameShow: boolean;
        } & {
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
        } & Vue & {
            $refs: {
                canvas: HTMLDivElement;
                background: HTMLDivElement;
            };
        }, object, object, object, Record<never, any>>;
    };
}, {
    prefixCls: string;
    /** flowchart 组件库内部的流程图数据拷贝 */
    flowChartData: FlowChartData;
    /** 处理过的画布尺寸 */
    processedCanvasSize: ICanvasSize;
    /** 快照， snapshot[0] 为当前状态 */
    snapshots: FlowChartData[];
    /** 重做栈 */
    redoStack: FlowChartData[];
    /** 是否正在创建节点 */
    isCreatingNode: boolean;
    /** 是否显示创建节点 */
    isCreateNodeShow: boolean;
    createNode: FlowChartNode;
    isMouseInsideCanvas: boolean;
    eventHandlers: {
        onDragZoneNodeMouseDown: ((node: FlowChartNode, event: MouseEvent) => void)[];
        onFlowChartMouseMove: ((event: MouseEvent) => void)[];
        onDocumentMouseUp: ((event: MouseEvent) => void)[];
    };
}, {
    /** 外部 API ，获取实时的流程图数据 */
    getFlowChart(): FlowChartData;
    /** 外部 API， 获取选中的元素 */
    getSelectedCharts(): (FlowChartLink | FlowChartNode)[];
    /** 外部 API ，清除选中的元素 */
    clearSelectedCharts(): void;
    /** 外部 API， 获取起始元素 */
    getStartCharts(): {
        nodes: FlowChartNode[];
        links: FlowChartLink[];
    };
    /** 外部 API， 添加节点 */
    addNode(node: IFlowChartNode, takeSnapshot?: boolean): FlowChartNode;
    /** 外部 API， 添加连线 */
    addLink(link: IFlowChartLink, takeSnapshot?: boolean): FlowChartLink;
    /** 外部 API， 删除节点与连线 */
    deleteCharts(ids: string[], takeSnapshot?: boolean): void;
    /** 外部 API， 删除单个节点或连线 */
    deleteChart(id: string, takeSnapshot?: boolean): void;
    /** 外部 API， 设置元素数据 */
    setChartData(id: string, valueObj: {
        [key: string]: any;
    }, takeSnapshot?: boolean): void;
    /** 外部 API， 删除元素数据 */
    deleteChartData(id: string, keys: string[], takeSnapshot?: boolean): void;
    /** 根据节点与连线坐标更新画布大小 */
    updateProcessedCanvasSize(): void;
    /** 拍摄快照 */
    takeSnapshot(): void;
    /** 使用当前的数据替换最新的快照 */
    replaceSnapshot(): void;
    /** 撤销 */
    undo(): void;
    /** 重做 */
    redo(): void;
    /** 还原为最新的快照状态，即 snapshot[0] */
    revert(): void;
    /** 将当前状态设置为初始的快照状态，即 snapshot[0] */
    fixSnapshot(): void;
    resetFlowChartData(data: FlowChartData): void;
    /** 处理拖拽区域 mousedown 事件 */
    handleDragZoneNodeMouseDown(node: FlowChartNode, event: MouseEvent): void;
    /** 处理创建节点时的 mousemove 事件 */
    handleFlowChartMouseMove(event: MouseEvent): void;
    handleDocumentMouseUp(event: MouseEvent): void;
    handleDeleteCharts(event: KeyboardEvent): void;
    handleFlowChartKeyDown(event: KeyboardEvent): void;
    /** 处理 Ctrl 键被按下 */
    handleCtrlKeyDown(event: KeyboardEvent): void;
}, {
    processedControlList: IControl[];
    controlMap: IControlMap;
}, {
    data: IFlowChartData;
    controlList: IControl[];
    linkType: linkTypeEnum;
    linkEditor: VueConstructor<Vue>;
    linkEditorWidth: number;
    linkEditorHeight: number;
    allowFreeLink: boolean;
    maxSnapshots: number;
    readonly: boolean;
    chartClassNameMethod: (chart: FlowChartLink | FlowChartNode) => string | object | (string | object)[];
    isChartDeletable: (chart: FlowChartLink | FlowChartNode) => boolean;
    isChartEditable: (chart: FlowChartLink | FlowChartNode) => boolean;
    canvasScale: number;
    canvasSize: ICanvasSize;
    canvasPadding: number;
    linkArrowWidth: number;
    linkArrowHeight: number;
    provideChartProps: unknown;
}>;
export default _default;
