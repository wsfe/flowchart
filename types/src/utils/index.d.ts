import { ICanvasCoordinate } from '../interfaces';
/**
 * 获取元素相对视口位置
 * @param element 元素
 */
export declare const getElementPosition: (element: HTMLElement) => {
    top: number;
    left: number;
};
/**
 * 获取鼠标相对元素位置
 * @param event 鼠标事件
 * @param element 元素
 */
export declare const getMousePositionRelativeToElement: (event: MouseEvent, element: HTMLElement) => {
    x: number;
    y: number;
};
/**
 * 判断鼠标位置是否在元素内
 * @param event 鼠标事件
 * @param element 元素
 */
export declare const ifMouseInsideElement: (event: MouseEvent, element: HTMLElement) => boolean;
/**
 * 判断某个元素的父级是否存在含有特定 class 的元素，搜索到特定元素停止
 * @param element 目标元素
 * @param className 父级 class
 * @param stopElement 搜到此元素则停止搜索
 */
export declare const hasParentWithClassName: (element: HTMLElement, className: string, stopElement: HTMLElement) => boolean;
/**
 * 获取两个坐标的距离
 * @param c1 坐标1
 * @param c2 坐标2
 */
export declare const getDistance: (c1: ICanvasCoordinate, c2: ICanvasCoordinate) => number;
/**
 * 获取弧度
 * @param rotate 角度
 */
export declare const getRadian: (rotate: number) => number;
/**
 * 获取点到直线的距离
 * @param point 点坐标
 * @param lineCoordinate 直线上任意一点坐标
 * @param rotate 直线旋转角度
 */
export declare const getDistanceFromPointToLine: (point: ICanvasCoordinate, lineCoordinate: ICanvasCoordinate, rotate: number) => number;
/**
 * 获取数据，为空则返回默认值
 * @param value 数据
 * @param defaultValue 默认值
 */
export declare const get: <T>(value: T | null | undefined, defaultValue: T) => T;
/**
 * 获取缩放后的坐标
 * @param c 源坐标
 * @param scale 缩放倍数
 */
export declare const getScaledCoordinate: (c: ICanvasCoordinate, scale: number) => ICanvasCoordinate;
