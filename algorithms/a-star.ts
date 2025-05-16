import type { Node } from "@/types/node"
import { getNeighbors, calculateHeuristic } from "@/lib/grid-utils"

export function runAStarAlgorithm(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
  endNodePos: { row: number; col: number },
): { visitedNodesInOrder: Node[]; shortestPath: Node[] | null } {
  const visitedNodesInOrder: Node[] = []

  // Initialize start node
  startNode.distance = 0
  startNode.gScore = 0
  startNode.hScore = calculateHeuristic(startNode.row, startNode.col, endNodePos.row, endNodePos.col)
  startNode.fScore = startNode.hScore

  const openSet: Node[] = [startNode]
  const closedSet: Set<string> = new Set()

  while (openSet.length > 0) {
    // Sort open set by fScore
    openSet.sort((a, b) => a.fScore - b.fScore)

    // Get node with lowest fScore
    const currentNode = openSet.shift()!

    // If we reached the end node
    if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
      // Update the end node's previousNode reference
      endNode.previousNode = currentNode.previousNode

      // Reconstruct and return the path
      const shortestPath = getShortestPath(endNode)
      return { visitedNodesInOrder, shortestPath }
    }

    // Add to closed set
    closedSet.add(`${currentNode.row}-${currentNode.col}`)

    // Mark as visited
    currentNode.isVisited = true
    if (currentNode.type !== "start" && currentNode.type !== "end") {
      visitedNodesInOrder.push(currentNode)
    }

    // Get neighbors
    const neighbors = getNeighbors(currentNode, grid)

    for (const neighbor of neighbors) {
      if (closedSet.has(`${neighbor.row}-${neighbor.col}`)) continue

      // Calculate tentative gScore
      const tentativeGScore = currentNode.gScore + 1

      // If this path is better than previous one
      if (tentativeGScore < neighbor.gScore) {
        neighbor.previousNode = currentNode
        neighbor.gScore = tentativeGScore
        neighbor.hScore = calculateHeuristic(neighbor.row, neighbor.col, endNodePos.row, endNodePos.col)
        neighbor.fScore = neighbor.gScore + neighbor.hScore

        // Add to open set if not already there
        if (!openSet.some((node) => node.row === neighbor.row && node.col === neighbor.col)) {
          openSet.push(neighbor)
        }
      }
    }
  }

  // No path found
  return { visitedNodesInOrder, shortestPath: null }
}

// Helper function to get the shortest path
function getShortestPath(endNode: Node): Node[] {
  const shortestPath: Node[] = []
  let currentNode: Node | null = endNode

  while (currentNode !== null) {
    shortestPath.unshift(currentNode)
    currentNode = currentNode.previousNode
  }

  return shortestPath
}
