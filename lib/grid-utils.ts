import type { Node } from "@/types/node"

// Create initial grid
export const createInitialGrid = (rows: number, cols: number): Node[][] => {
  const grid: Node[][] = []

  for (let row = 0; row < rows; row++) {
    const currentRow: Node[] = []
    for (let col = 0; col < cols; col++) {
      currentRow.push({
        row,
        col,
        type: "empty",
        isVisited: false,
        distance: Number.POSITIVE_INFINITY,
        previousNode: null,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
        hScore: Number.POSITIVE_INFINITY,
      })
    }
    grid.push(currentRow)
  }

  // Set default start and end positions
  const startNode = grid[Math.floor(rows / 2)][Math.floor(cols / 5)]
  const endNode = grid[Math.floor(rows / 2)][Math.floor((cols * 4) / 5)]
  startNode.type = "start"
  endNode.type = "end"

  return grid
}

// Get neighbors
export const getNeighbors = (node: Node, grid: Node[][]): Node[] => {
  const { row, col } = node
  const neighbors: Node[] = []
  const rows = grid.length
  const cols = grid[0].length

  // Up
  if (row > 0) neighbors.push(grid[row - 1][col])
  // Right
  if (col < cols - 1) neighbors.push(grid[row][col + 1])
  // Down
  if (row < rows - 1) neighbors.push(grid[row + 1][col])
  // Left
  if (col > 0) neighbors.push(grid[row][col - 1])

  // Filter out walls
  return neighbors.filter((neighbor) => neighbor.type !== "wall")
}

// Get shortest path
export const getShortestPath = (endNode: Node): Node[] => {
  const shortestPath: Node[] = []
  let currentNode: Node | null = endNode

  while (currentNode !== null) {
    shortestPath.unshift(currentNode)
    currentNode = currentNode.previousNode
  }

  return shortestPath
}

// Calculate heuristic (Manhattan distance)
export const calculateHeuristic = (row: number, col: number, endRow: number, endCol: number): number => {
  return Math.abs(row - endRow) + Math.abs(col - endCol)
}

// Get all nodes from grid
export const getAllNodes = (grid: Node[][]): Node[] => {
  const nodes: Node[] = []
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node)
    }
  }
  return nodes
}

// Sort nodes by distance
export const sortNodesByDistance = (nodes: Node[]): void => {
  nodes.sort((a, b) => a.distance - b.distance)
}

// Check if a node is adjacent to a path node
export const isAdjacentToPath = (node: Node, grid: Node[][]): boolean => {
  const { row, col } = node
  const rows = grid.length
  const cols = grid[0].length

  // Check all adjacent cells
  if (row > 0 && grid[row - 1][col]?.type === "path") return true
  if (col < cols - 1 && grid[row][col + 1]?.type === "path") return true
  if (row < rows - 1 && grid[row + 1][col]?.type === "path") return true
  if (col > 0 && grid[row][col - 1]?.type === "path") return true

  return false
}

// Create a deep copy of the grid
export const cloneGrid = (grid: Node[][]): Node[][] => {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      previousNode: null, // Reset previousNode to avoid circular references
    })),
  )
}

// Find node by position
export const getNodeAt = (grid: Node[][], row: number, col: number): Node => {
  return grid[row][col]
}
