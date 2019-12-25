import { IControlStyle, IControlAnchor, ICanvasCoordinate, ICanvasSize } from '../interfaces';
/**
 * 获取一个坐标旋转后的坐标
 * @param originCoordinate 原坐标
 * @param center 旋转圆心坐标
 * @param rotate 旋转角度
 */
export declare const getRotatedCoordinate: (originCoordinate: ICanvasCoordinate, center: ICanvasCoordinate, rotate: number) => ICanvasCoordinate;
/**
 * 获取锚点相对于画布的坐标位置
 * @param style 节点 style ，或者一片区域
 * @param containerSize 旋转后的节点/区域宽高
 * @param anchor 锚点位置信息
 */
export declare const getAnchorCoordinate: (style: Pick<IControlStyle, "x" | "y" | "width" | "height" | "rotate">, containerSize: ICanvasSize, anchor: IControlAnchor) => ICanvasCoordinate;
/**
 * 获取旋转后节点相对画布坐标，取 resizers 中最小的 x, y 点即可
 * @param resizers resizer 列表
 */
export declare const getRotatedNodeCoordinate: (resizers: ICanvasCoordinate[]) => ICanvasCoordinate;
/**
 * 根据两点与旋转角度获取两条直线的交点。此方法只会返回一个点，即 1-y 的点，要获取 1-x 的交点，把 c1, c2 反过来再调用一次
 * 例如，固定锚点为 (0, 0) ，则返回与对角坐标画出的直线中 (0, 1) 的交点
 * @param c1 点1坐标
 * @param c2 点2坐标
 * @param rotate 节点旋转角度
 */
export declare const getIntersection: (c1: ICanvasCoordinate, c2: ICanvasCoordinate, rotate: number) => ICanvasCoordinate;
/**
 * TODO: 考虑其他旋转情况
 * TODO: 限制最大尺寸
 * TODO: 最小/最大尺寸，精确到宽高
 * 根据限制的最小/最大尺寸纠正鼠标的坐标位置
 * @param fixedCoordinate 固定点坐标
 * @param fixedAnchor 固定点锚点 (0-1)
 * @param rotate 旋转角度
 * @param minSize 最小尺寸
 * @param maxSize 最大尺寸
 */
export declare const correctMouseCoordinate: (fixedCoordinate: ICanvasCoordinate, fixedAnchor: IControlAnchor, mouseCoordinate: ICanvasCoordinate, rotate: number, minSize?: number, maxSize?: number) => ICanvasCoordinate;
