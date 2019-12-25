import Vue, { VueConstructor } from 'vue';
import { FlowChartData, FlowChartNode, FlowChartLink } from '../store';
import { ICanvasCoordinate } from '../interfaces';
declare const _default: import("vue/types/vue").ExtendedVue<Vue & {
    $refs: {
        container: HTMLDivElement;
        clickpath: SVGPathElement;
        editor: HTMLDivElement;
        text: HTMLElement | undefined;
    };
    unwatchStartEndCoordinate?: Function | undefined;
    handleClickOutside: (event: MouseEvent) => void;
}, {
    prefixCls: string;
    anchorSize: number;
    /** 是否为编辑状态 */
    isEditing: boolean;
    /** 连线数据缓存 */
    linkDataCache: {
        [key: string]: any;
        text: string;
    };
}, {
    getSVGPoint(c: ICanvasCoordinate): ICanvasCoordinate;
    getScaledPoint(c: ICanvasCoordinate): ICanvasCoordinate;
    updatePolylinePoints(): void;
    handleKeyDown(event: KeyboardEvent): void;
    handleLinkMouseDown(event: MouseEvent, isPolyline: boolean, polylineIndex: number): void;
    handleLinkCtrlMouseDown(event: MouseEvent): void;
    /** 双击连线，进入编辑状态 */
    handleLinkDblClick(): void;
    handleStartAnchorMouseDown(event: MouseEvent): void;
    handleEndAnchorMouseDown(event: MouseEvent): void;
    handleUpdateLinkData(valueObj: {
        [key: string]: any;
    }, takeSnapshot?: boolean): void;
    handleDeleteLinkData(keys: string[], takeSnapshot?: boolean): void;
    handleTakeSnapshot(): void;
    handleReplaceSnapshot(): void;
    /** 处理输入连线文字 */
    handleLinkTextChange(event: InputEvent): void;
}, {
    isLinkingSameNode: boolean;
    startCoordinate: ICanvasCoordinate;
    endCoordinate: ICanvasCoordinate;
    linkWidth: number;
    linkHeight: number;
    linkLeft: number;
    linkTop: number;
    svgStartCoordinate: ICanvasCoordinate;
    svgEndCoordinate: ICanvasCoordinate;
    arrowPoints: string;
    pathGroups: {
        start: ICanvasCoordinate;
        end: ICanvasCoordinate;
        isPolyline: boolean;
    }[];
    editorPositionStyle: object;
}, {
    link: FlowChartLink;
    nodes: FlowChartNode[];
    flowChartData: FlowChartData;
    linkEditor: VueConstructor<Vue>;
    linkEditorWidth: number;
    linkEditorHeight: number;
    injectProps: unknown;
    isSelected: boolean;
    isGroupSelected: boolean;
    isChartEditable: (chart: FlowChartLink) => boolean;
    linkArrowWidth: number;
    linkArrowHeight: number;
    readonly: boolean;
    canvasScale: number;
    canvasPadding: number;
}>;
export default _default;
