/** 最小堆 */
declare type CompareFunctionType<T> = (a: T, b: T) => -1 | 0 | 1;
export default class BinaryHeap<T> {
    private heap;
    private compareFunction;
    constructor(elements: T[], compareFunction?: CompareFunctionType<T>);
    insert(value: T): void;
    delete(): T | undefined;
    up(position?: number): void;
    down(position: number): void;
    get length(): number;
    get array(): T[];
}
export {};
