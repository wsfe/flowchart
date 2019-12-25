import { ICanvasCoordinate } from '../interfaces'

export const getBendingPoints = (points: ICanvasCoordinate[]): ICanvasCoordinate[] => {
  if (points.length < 4) return points
  const result = [points[0]]
  let i = 2
  /** 当前线段是否水平走向 */
  let isGoingHorizontal = points[0].x !== points[1].x
  const obj = { flag: { value: isGoingHorizontal, point: { x: 0, y: 0 } } }
  Object.defineProperty(obj, 'flag', {
    set ({ value, point }: { value: boolean, point: ICanvasCoordinate }) {
      if (isGoingHorizontal !== value) {
        result.push(point)
      }
      isGoingHorizontal = value
    },
  })
  while (i < points.length) {
    const current = points[i]
    const previous = points[i - 1]
    obj.flag = {
      value: previous.x !== current.x,
      point: previous,
    }
    i++
  }
  result.push(points[points.length - 1])
  return result
}
