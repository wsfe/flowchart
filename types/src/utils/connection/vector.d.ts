/** 二维向量 */
export default class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number);
    /** 是否正交 */
    isOrthogonal(v: Vector): boolean;
    /** 是否平行 */
    isParallel(v: Vector): boolean;
    /** 是否同向 */
    isSameDirection(v: Vector): boolean;
    /** 点乘 */
    dot(v: Vector): number;
    /** 叉乘，本来应该返回向量的，这里因为是二维的，直接返回数字了，返回的结果是 当前向量 x v */
    cross(v: Vector): number;
    /** 求与向量 v 的夹角余弦值 */
    cosine(v: Vector): number;
    /** 单位化 */
    normalize(): Vector;
    /** 向量长度 */
    get length(): number;
}
