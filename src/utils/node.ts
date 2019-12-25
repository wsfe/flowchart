import { IControlStyle, IControlAnchor, ICanvasCoordinate, ICanvasSize } from '../interfaces'
import { getDistance, getRadian, getDistanceFromPointToLine } from './index'

/**
 * 获取一个坐标旋转后的坐标
 * @param originCoordinate 原坐标
 * @param center 旋转圆心坐标
 * @param rotate 旋转角度
 */
export const getRotatedCoordinate = (originCoordinate: ICanvasCoordinate, center: ICanvasCoordinate, rotate: number): ICanvasCoordinate => {
  const radius = getDistance(originCoordinate, center)
  const xRadian = Math.acos((center.x - originCoordinate.x) / radius) + getRadian(rotate)
  const yRadian = Math.asin((center.y - originCoordinate.y) / radius) + getRadian(rotate)
  return {
    x: Math.trunc(center.x - radius * Math.cos(xRadian)),
    y: Math.trunc(center.y - radius * Math.sin(yRadian)),
  }
}

/**
 * 获取锚点相对于画布的坐标位置
 * @param style 节点 style ，或者一片区域
 * @param containerSize 旋转后的节点/区域宽高
 * @param anchor 锚点位置信息
 */
export const getAnchorCoordinate = (style: Pick<IControlStyle, 'width' | 'height' | 'x' | 'y' | 'rotate'>, containerSize: ICanvasSize, anchor: IControlAnchor): ICanvasCoordinate => {
  const { width, height, x, y, rotate } = style
  const originCoordinate = {
    x: x + width * anchor.x,
    y: y + height * anchor.y,
  }
  const center = {
    x: x + containerSize.width / 2,
    y: y + containerSize.height / 2,
  }
  return getRotatedCoordinate(originCoordinate, center, rotate)
}

/**
 * 获取旋转后节点相对画布坐标，取 resizers 中最小的 x, y 点即可
 * @param resizers resizer 列表
 */
export const getRotatedNodeCoordinate = (resizers: ICanvasCoordinate[]): ICanvasCoordinate => {
  return {
    x: Math.min(...resizers.map((resizer) => resizer.x)),
    y: Math.min(...resizers.map((resizer) => resizer.y)),
  }
}

/**
 * 根据两点与旋转角度获取两条直线的交点。此方法只会返回一个点，即 1-y 的点，要获取 1-x 的交点，把 c1, c2 反过来再调用一次
 * 例如，固定锚点为 (0, 0) ，则返回与对角坐标画出的直线中 (0, 1) 的交点
 * @param c1 点1坐标
 * @param c2 点2坐标
 * @param rotate 节点旋转角度
 */
export const getIntersection = (c1: ICanvasCoordinate, c2: ICanvasCoordinate, rotate: number): ICanvasCoordinate => {
  if (rotate % 90 === 0) {
    // 旋转角度为 (PI/2) 的倍数的情况
    return {
      x: c1.x,
      y: c2.y,
    }
  } else {
    // 通用情况
    const radian = getRadian(rotate)
    const tanr = Math.tan(radian)
    const cotr = 1 / tanr
    const a = (cotr * c1.x + tanr * c2.x + c1.y - c2.y) / (tanr + cotr)
    return {
      x: a,
      y: cotr * (c1.x - a) + c1.y,
    }
  }
}

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
export const correctMouseCoordinate = (fixedCoordinate: ICanvasCoordinate, fixedAnchor: IControlAnchor, mouseCoordinate: ICanvasCoordinate, rotate: number, minSize: number = 20, maxSize: number = Infinity): ICanvasCoordinate => {
  const radian = getRadian(rotate)
  if (rotate % 180 === 0) {
    // d1 为鼠标坐标到节点边缘的距离
    // d2 为鼠标坐标到限制的尺寸所作直线的距离
    const dx1 = getDistanceFromPointToLine(mouseCoordinate, fixedCoordinate, rotate)
    const lineX = fixedAnchor.x === 0 ? fixedCoordinate.x + minSize * Math.cos(radian) : fixedCoordinate.x - minSize * Math.cos(radian)
    const lineXCoordinate = {
      x: lineX,
      y: mouseCoordinate.y,
    }
    const dx2 = getDistanceFromPointToLine(mouseCoordinate, lineXCoordinate, rotate)
    if (dx1 < dx2 || dx1 < minSize) {
      mouseCoordinate = lineXCoordinate
    }

    const dy1 = getDistanceFromPointToLine(mouseCoordinate, fixedCoordinate, rotate + 90)
    const lineY = fixedAnchor.y === 0 ? fixedCoordinate.y + minSize * Math.cos(radian) : fixedCoordinate.y - minSize * Math.cos(radian)
    const lineYCoordinate = {
      x: mouseCoordinate.x,
      y: lineY,
    }
    const dy2 = getDistanceFromPointToLine(mouseCoordinate, lineYCoordinate, rotate + 90)
    if (dy1 < dy2 || dy1 < minSize) {
      mouseCoordinate = lineYCoordinate
    }
  }

  return mouseCoordinate
}
