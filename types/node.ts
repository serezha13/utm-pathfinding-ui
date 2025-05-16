// Node types
export type NodeType = "empty" | "wall" | "start" | "end" | "visited" | "path"
export type Algorithm = "astar" | "dijkstra" | "dfs"

// Node interface
export interface Node {
  row: number
  col: number
  type: NodeType
  isVisited: boolean
  distance: number
  previousNode: Node | null
  fScore: number
  gScore: number
  hScore: number
}

// Grid dimensions
export const ROWS = 20
export const COLS = 30
