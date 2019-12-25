/** 二维向量 */

export default class Vector {
  constructor (public x: number, public y: number) {}

  /** 是否正交 */
  isOrthogonal (v: Vector): boolean {
    return this.dot(v) === 0
  }

  /** 是否平行 */
  isParallel (v: Vector): boolean {
    return this.x * v.y - v.x * this.y === 0
  }

  /** 是否同向 */
  isSameDirection (v: Vector): boolean {
    return this.isParallel(v) && this.dot(v) > 0
  }

  /** 点乘 */
  dot (v: Vector): number {
    return this.x * v.x + this.y * v.y
  }

  /** 叉乘，本来应该返回向量的，这里因为是二维的，直接返回数字了，返回的结果是 当前向量 x v */
  cross (v: Vector): number {
    return this.x * v.y - v.x * this.y
  }

  /** 求与向量 v 的夹角余弦值 */
  cosine (v: Vector): number {
    if (this.length === 0 || v.length === 0) return 0
    return this.dot(v) / (this.length * v.length)
  }

  /** 单位化 */
  normalize (): Vector {
    return new Vector(this.x / this.length, this.y / this.length)
  }

  /** 向量长度 */
  get length (): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
  }
}
