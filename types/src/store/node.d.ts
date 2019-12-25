import { IFlowChartNode, IControlStyle, IControlAnchor, ICanvasCoordinate, IControl } from '../interfaces';
export declare class FlowChartNode implements IFlowChartNode {
    readonly id: string;
    controlName: string;
    style: IControlStyle;
    nodeData: {
        [key: string]: any;
    };
    constructor(options: IFlowChartNode);
    setData(valueObj: {
        [key: string]: any;
    }): boolean;
    deleteData(keys: string[]): boolean;
    /**
     * 根据偏移量移动节点
     * @param offset 偏移量
     */
    moveByOffset(offset: ICanvasCoordinate): void;
    /**
     * 获取节点容器宽高，因为在节点旋转后，节点宽高不等于容器宽高，所以需要这个方法
     * @param style 节点位置信息
     */
    getNodeContainerSize(): {
        width: number;
        height: number;
    };
    /**
     * 获取锚点相对于画布的坐标位置
     * @param anchor 锚点位置信息
     */
    getAnchorCoordinate(anchor: IControlAnchor): ICanvasCoordinate;
    get z(): number;
    /** 节点对应控件 */
    get control(): IControl;
    get anchors(): IControlAnchor[];
    /** 获取节点中心坐标点 */
    get center(): ICanvasCoordinate;
}
