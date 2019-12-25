export interface ICanvasSize {
  width: number,
  height: number,
}

export interface ICanvasCoordinate {
  x: number,
  y: number,
}

export type ICanvasArea = ICanvasSize & ICanvasCoordinate
