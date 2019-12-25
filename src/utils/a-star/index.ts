import BinaryHeap from './binary-heap'
import Vector from '../connection/vector'

interface ICoordinate {
  x: number,
  y: number,
}

type IHeapType = ICoordinate & IWalkRecord

interface IWalkRecord {
  g: number,
  h: number,
  f: number,
  // 转弯次数
  t: number,
  parent: IHeapType | null,
}

interface IWalkMap {
  [x: number]: {
    [y: number]: IHeapType,
  }
}

/** 获取曼哈顿距离 */
const getManhattanDistance = (c1: ICoordinate, c2: ICoordinate): number => {
  return Math.abs(c1.x - c2.x) + Math.abs(c1.y - c2.y)
}

/**
 * A*
 * @param start 起点
 * @param end 终点
 * @param getWalkableNodes 根据当前节点，获取此节点可到达的节点
 * @param getCost 获取两个节点之间的成本
 */
const AStar = (
  start: ICoordinate,
  end: ICoordinate,
  getWalkableNodes: (currentNode: ICoordinate) => ICoordinate[],
  getCost: (a: ICoordinate, b: ICoordinate) => number,
): ICoordinate[] | null => {
  const walkMap: IWalkMap = {}
  const startEndDistance = getManhattanDistance(start, end)
  const startHeap: IHeapType = {
    ...start,
    g: 0,
    h: startEndDistance,
    f: startEndDistance,
    t: 0,
    parent: null,
  }
  walkMap[start.x] = {
    [start.y]: startHeap,
  }
  const openList: BinaryHeap<IHeapType> = new BinaryHeap(
    [startHeap],
    (a: IHeapType, b: IHeapType) => {
      if (a.f !== b.f) {
        // 先比较 f
        return ((a.f - b.f) / Math.abs(a.f - b.f)) as -1 | 1
      } else if (Math.abs(a.h - a.g) !== Math.abs(b.h - b.g)) {
        // f 相同，则选择 abs(g-h) 小的，为了优先走中点
        return ((Math.abs(a.h - a.g) - Math.abs(b.h - b.g)) / Math.abs(Math.abs(a.h - a.g) - Math.abs(b.h - b.g))) as -1 | 1
      } else if (a.t !== b.t) {
        // abs(g-h) 相同则优先走拐弯少的
        return ((a.t - b.t) / Math.abs(a.t - b.t)) as -1 | 1
      } else return 0
    },
  )
  const openSet = new Set([`${start.x},${start.y}`])
  const closeSet = new Set<string>()
  while (openList.length) {
    const currentNode = openList.delete() as IHeapType
    const currentSetElement = `${currentNode.x},${currentNode.y}`
    openSet.delete(currentSetElement)
    closeSet.add(currentSetElement)
    const walkableNodes: ICoordinate[] = getWalkableNodes(currentNode).filter((walkableNode) => !closeSet.has(`${walkableNode.x},${walkableNode.y}`))
    for (let node of walkableNodes) {
      if (node.x === end.x && node.y === end.y) {
        // 如果找到终点
        const path = []
        let current: IHeapType | null = currentNode
        while (current) {
          path.unshift({
            x: current.x,
            y: current.y,
          })
          current = walkMap[current.x][current.y].parent
        }
        return [...path, Object.assign({}, end)]
      }
      const exist = openSet.has(`${node.x},${node.y}`)
      if (exist) {
        // 如果已经在 open list 里，则比较 g 的大小
        const existInOpenList = walkMap[node.x][node.y]
        /** 当前节点与已存在节点之间的成本 */
        const cost = getCost(currentNode, existInOpenList)
        if (currentNode.g + cost < existInOpenList.g) {
          existInOpenList.g = currentNode.g + cost
          existInOpenList.f = existInOpenList.g + existInOpenList.h
          const parentNode = currentNode.parent
          existInOpenList.t = currentNode.t + (parentNode && new Vector(parentNode.x - currentNode.x, parentNode.y - currentNode.y).isParallel(new Vector(node.x - currentNode.x, node.y - currentNode.y)) ? 0 : 1)
          openList.up(openList.array.indexOf(existInOpenList))
          walkMap[node.x][node.y] = existInOpenList
        }
      } else {
        // 否则计算 f, g, h 并加入 open list
        const g = currentNode.g + getCost(currentNode, node)
        const h = getManhattanDistance(node, end)
        let t = currentNode.t
        if (currentNode.parent) {
          const parentNode = currentNode.parent
          if (!(new Vector(parentNode.x - currentNode.x, parentNode.y - currentNode.y).isParallel(new Vector(node.x - currentNode.x, node.y - currentNode.y)))) {
            t++
          }
        }
        const heap = {
          ...node,
          g,
          h,
          f: g + h,
          t,
          parent: currentNode,
        }
        if (!walkMap[node.x]) walkMap[node.x] = {}
        walkMap[node.x][node.y] = heap
        openList.insert(heap)
        openSet.add(`${node.x},${node.y}`)
      }
    }
  }

  // 没有找到路径
  return null
}

export default AStar
