/**
 * 由于 Vue 不支持 ES6 Set
 * 这边使用数组来模拟 Set ，支持一些简单的功能，不支持迭代器相关方法
 */
declare type forEachCallback<T> = (currentValue: T, currentKey: T, set: FlowChartSet<T>) => void;
export default class FlowChartSet<T> {
    private set;
    constructor(it?: T[]);
    get size(): number;
    has(element: T): boolean;
    add(element: T): T[];
    clear(): void;
    delete(element: T): boolean;
    forEach(callback: forEachCallback<T>, thisArg?: any): void;
}
/**
 * 获取集合元素组成的数组，由于上述 set 没有实现迭代器，因此不能用 Array.from 来转为数组
 * @param set 集合
 */
export declare const getSetArray: <T>(set: FlowChartSet<T>) => T[];
export {};
