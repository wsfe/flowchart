import { IFlowChartLink, IControlAnchor, ICanvasCoordinate } from '../interfaces';
import { linkTypeEnum } from '../const';
import { FlowChartNode } from './node';
export declare class FlowChartLink implements IFlowChartLink {
    static nodes: FlowChartNode[];
    readonly id: string;
    linkType: keyof typeof linkTypeEnum;
    polylinePoints: ICanvasCoordinate[];
    startNodeId?: string | null;
    startAnchor: IControlAnchor;
    startCoordinate: ICanvasCoordinate;
    endNodeId?: string | null;
    endAnchor: IControlAnchor;
    endCoordinate: ICanvasCoordinate;
    editorPosition: number;
    z: number;
    linkData: {
        [key: string]: any;
        text: string;
    };
    constructor(options: IFlowChartLink);
    setData(valueObj: {
        [key: string]: any;
    }): boolean;
    deleteData(keys: string[]): boolean;
    /**
     * 根据偏移量移动连线
     * @param offset 偏移量
     */
    moveByOffset(offset: ICanvasCoordinate): void;
    /**
     * 根据偏移量平移所有拐点
     * @param offset 偏移量
     */
    private movePolylinePointsByOffset;
    /** 是否自由连线 */
    isLinkFree(): boolean;
    /**
     * 设置折线位置
     * @param polylineIndex 折线组索引
     * @param position 折线走向垂直方向新位置数值
     */
    setPolylinePosition(polylineIndex: number, position: number): void;
    /**
     * 根据折线组获取折线走向是 x 还是 y
     * @param polylineIndex 折线组索引
     */
    getPolylineDirectionByIndex(polylineIndex: number): 'x' | 'y' | null;
    /** 连线实际起点 */
    get startCoordinate_(): ICanvasCoordinate;
    /** 连线实际终点 */
    get endCoordinate_(): ICanvasCoordinate;
    get pathGroups(): Array<{
        start: ICanvasCoordinate;
        end: ICanvasCoordinate;
        isPolyline: boolean;
    }>;
    /** 连线长度 */
    get pathLength(): number;
    /** 连线编辑器中间坐标 */
    get editorCenterCoordinate(): ICanvasCoordinate;
}
