/**
 * 由于 Vue 不支持 ES6 Set
 * 这边使用数组来模拟 Set ，支持一些简单的功能，不支持迭代器相关方法
 */

type forEachCallback<T> = (currentValue: T, currentKey: T, set: FlowChartSet<T>) => void

export default class FlowChartSet<T> {
  private set: T[] = []

  constructor (it?: T[]) {
    if (it) {
      this.set = [...new Set(it)]
    }
  }

  get size () {
    return this.set.length
  }

  has (element: T) {
    return this.set.indexOf(element) > -1
  }

  add (element: T) {
    if (!this.has(element)) {
      this.set.push(element)
    }
    return this.set
  }

  clear () {
    this.set.splice(0, this.size)
  }

  delete (element: T) {
    const index = this.set.indexOf(element)
    if (index > -1) {
      this.set.splice(index, 1)
      return true
    }
    return false
  }

  forEach (callback: forEachCallback<T>, thisArg?: any) {
    this.set.forEach((value) => {
      callback.call(thisArg, value, value, this)
    })
  }
}

/**
 * 获取集合元素组成的数组，由于上述 set 没有实现迭代器，因此不能用 Array.from 来转为数组
 * @param set 集合
 */
export const getSetArray = <T>(set: FlowChartSet<T>): T[] => {
  const result: T[] = []
  set.forEach((element) => {
    result.push(element)
  })
  return result
}
