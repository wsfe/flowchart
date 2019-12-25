import { IControlStyle, IFlowChartNode, ICanvasSize } from '../interfaces';
/** 控件默认配置 */
export declare const DEFAULT_CONTROL_CONFIG: {
    /** 在 isEditing 状态改变时拍摄快照，默认 true */
    takeSnapshotOnEditChange: boolean;
    /** 节点遮罩宽 */
    maskWidth: string;
    /** 节点遮罩高 */
    maskHeight: string;
    /** 节点遮罩 x 方向偏移量 */
    maskOffsetX: number;
    /** 节点遮罩 y 方向偏移量 */
    maskOffsetY: number;
    /** 是否可缩放 */
    resizable: boolean;
};
/** 控件默认位置信息 */
export declare const DEFAULT_CONTROL_STYLE: IControlStyle;
/** 节点默认数据 */
export declare const DEFAULT_NODE: IFlowChartNode;
/** 画布默认尺寸 */
export declare const DEFAULT_CANVAS_SIZE: ICanvasSize;
/** 默认锚点 */
export declare const DEFAULT_ANCHORS: {
    x: number;
    y: number;
}[];
