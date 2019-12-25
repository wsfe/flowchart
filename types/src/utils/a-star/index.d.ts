interface ICoordinate {
    x: number;
    y: number;
}
/**
 * A*
 * @param start 起点
 * @param end 终点
 * @param getWalkableNodes 根据当前节点，获取此节点可到达的节点
 * @param getCost 获取两个节点之间的成本
 */
declare const AStar: (start: ICoordinate, end: ICoordinate, getWalkableNodes: (currentNode: ICoordinate) => ICoordinate[], getCost: (a: ICoordinate, b: ICoordinate) => number) => ICoordinate[] | null;
export default AStar;
