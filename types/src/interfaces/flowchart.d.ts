import { IControlStyle, IControlAnchor } from './control';
import { linkTypeEnum } from '../const';
import { ICanvasCoordinate } from './canvas';
/** 节点 */
export interface IFlowChartNode {
    id?: string;
    /** 控件名称 */
    controlName: string;
    /** 节点位置信息 */
    style: Partial<IControlStyle>;
    /** 节点额外数据，在每个控件中可自定义 */
    nodeData?: {
        [key: string]: any;
    };
}
/** 连线 */
export interface IFlowChartLink {
    id?: string;
    /** 连线类型 */
    linkType?: keyof typeof linkTypeEnum;
    /** 折线正交拐点 */
    polylinePoints?: ICanvasCoordinate[];
    /** 起始节点 id */
    startNodeId?: string | null;
    /** 起始锚点 */
    startAnchor?: IControlAnchor;
    /** 如果不是连接节点，则需要提供相对于画布的坐标 */
    startCoordinate?: ICanvasCoordinate;
    /** 终止节点 id */
    endNodeId?: string | null;
    /** 终止锚点 */
    endAnchor?: IControlAnchor;
    /** 如果不是连接节点，则需要提供相对于画布的坐标 */
    endCoordinate?: ICanvasCoordinate;
    /** 连线编辑器位置，0-1 的数字 */
    editorPosition?: number;
    /** 图层顺序 */
    z?: number;
    /** 连线额外数据 */
    linkData?: {
        [key: string]: any;
        /** 连线文字 */
        text: string;
    };
}
/** flowchart 数据格式 */
export interface IFlowChartData {
    nodes: IFlowChartNode[];
    links: IFlowChartLink[];
}
