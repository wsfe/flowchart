/** 最小堆 */

type CompareFunctionType<T> = (a: T, b: T) => -1 | 0 | 1

export default class BinaryHeap<T> {
  private heap: T[] = []

  private compareFunction: CompareFunctionType<T> = (a: T, b: T) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a === b ? 0 : ((a - b) / Math.abs(a - b)) as -1 | 1
    }
    return 0
  }

  constructor (elements: T[], compareFunction?: CompareFunctionType<T>) {
    if (typeof compareFunction === 'function') {
      this.compareFunction = compareFunction
    }
    this.heap = elements
    for (let i = Math.floor((this.length - 2) / 2); i >= 0; i--) {
      this.down(i)
    }
  }

  insert (value: T) {
    this.heap.push(value)
    this.up()
  }

  delete (): T | undefined {
    const deleted = this.heap.shift()
    const last = this.heap.pop()
    if (last != null) {
      this.heap.unshift(last)
      this.down(0)
    }
    return deleted
  }

  up (position?: number) {
    let n = typeof position === 'number' ? position : this.length - 1
    if (n <= 0) return
    const target = this.heap[n]
    let parentIndex = Math.floor((n - 1) / 2)
    while (parentIndex >= 0 && this.compareFunction(target, this.heap[parentIndex]) === -1) {
      this.heap[n] = this.heap[parentIndex]
      n = parentIndex
      parentIndex = Math.floor((n - 1) / 2)
    }
    this.heap[n] = target
  }

  down (position: number) {
    const target = this.heap[position]
    let parentIndex = position
    let leftChildIndex = 2 * parentIndex + 1
    while (leftChildIndex < this.length) {
      let exchangeIndex = leftChildIndex
      const rightChildIndex = leftChildIndex + 1
      if (rightChildIndex < this.length && this.compareFunction(this.heap[rightChildIndex], this.heap[leftChildIndex]) === -1) {
        exchangeIndex = rightChildIndex
      }
      if (!(this.compareFunction(target, this.heap[exchangeIndex]) === 1)) break
      this.heap[parentIndex] = this.heap[exchangeIndex]
      parentIndex = exchangeIndex
      leftChildIndex = 2 * parentIndex + 1
    }
    this.heap[parentIndex] = target
  }

  get length () {
    return this.heap.length
  }

  get array () {
    return this.heap
  }
}
