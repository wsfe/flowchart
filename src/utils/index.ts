import { ICanvasCoordinate } from '../interfaces'

/**
 * 获取元素相对视口位置
 * @param element 元素
 */
export const getElementPosition = (element: HTMLElement) => {
  const { top, left } = element.getBoundingClientRect()
  return {
    top: Math.trunc(top),
    left: Math.trunc(left),
  }
}

/**
 * 获取鼠标相对元素位置
 * @param event 鼠标事件
 * @param element 元素
 */
export const getMousePositionRelativeToElement = (event: MouseEvent, element: HTMLElement) => {
  const elementPosition = getElementPosition(element)
  return {
    x: Math.trunc(event.clientX - elementPosition.left),
    y: Math.trunc(event.clientY - elementPosition.top),
  }
}

/**
 * 判断鼠标位置是否在元素内
 * @param event 鼠标事件
 * @param element 元素
 */
export const ifMouseInsideElement = (event: MouseEvent, element: HTMLElement): boolean => {
  const relativePosition = getMousePositionRelativeToElement(event, element)
  const { width, height } = element.getBoundingClientRect()
  return (
    relativePosition.x >= 0 && relativePosition.y >= 0 &&
    relativePosition.x <= width && relativePosition.y <= height
  )
}

/**
 * 判断某个元素的父级是否存在含有特定 class 的元素，搜索到特定元素停止
 * @param element 目标元素
 * @param className 父级 class
 * @param stopElement 搜到此元素则停止搜索
 */
export const hasParentWithClassName = (element: HTMLElement, className: string, stopElement: HTMLElement): boolean => {
  let parent = element.parentElement
  while (parent) {
    if (parent === stopElement) return false
    if (parent.classList.contains(className)) return true
    parent = parent.parentElement
  }
  return false
}

/**
 * 获取两个坐标的距离
 * @param c1 坐标1
 * @param c2 坐标2
 */
export const getDistance = (c1: ICanvasCoordinate, c2: ICanvasCoordinate): number => {
  return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2))
}

/**
 * 获取弧度
 * @param rotate 角度
 */
export const getRadian = (rotate: number): number => {
  return Math.PI * rotate / 180
}

/**
 * 获取点到直线的距离
 * @param point 点坐标
 * @param lineCoordinate 直线上任意一点坐标
 * @param rotate 直线旋转角度
 */
export const getDistanceFromPointToLine = (point: ICanvasCoordinate, lineCoordinate: ICanvasCoordinate, rotate: number): number => {
  if (rotate % 180 === 0) {
    return Math.abs(point.x - lineCoordinate.x)
  }
  if (rotate % 90 === 0) {
    return Math.abs(point.y - lineCoordinate.y)
  }
  const radian = getRadian(rotate)
  const cotr = 1 / Math.tan(radian)
  return Math.abs(cotr * point.x + point.y - cotr * lineCoordinate.x - lineCoordinate.y) / Math.sqrt(Math.pow(cotr, 2) + 1)
}

/**
 * 获取数据，为空则返回默认值
 * @param value 数据
 * @param defaultValue 默认值
 */
export const get = <T>(value: T | null | undefined, defaultValue: T): T => {
  if (value == null) return defaultValue
  return value
}

/**
 * 获取缩放后的坐标
 * @param c 源坐标
 * @param scale 缩放倍数
 */
export const getScaledCoordinate = (c: ICanvasCoordinate, scale: number): ICanvasCoordinate => {
  return {
    x: c.x * scale,
    y: c.y * scale,
  }
}
