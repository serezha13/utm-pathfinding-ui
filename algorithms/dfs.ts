import type { Node } from "@/types/node"
import { getNeighbors } from "@/lib/grid-utils"

export function runDFSAlgorithm(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
): { visitedNodesInOrder: Node[]; shortestPath: Node[] | null } {
  const visitedNodesInOrder: Node[] = []
  const stack: Node[] = [startNode]
  const visited: Set<string> = new Set([`${startNode.row}-${startNode.col}`])

  while (stack.length > 0) {
    // Get the top node from the stack
    const currentNode = stack.pop()!

    // If we reached the end node
    if (currentNode.row === endNode.row && currentNode.col === endNode.col) {
      // Update the end node's previousNode reference
      endNode.previousNode = currentNode.previousNode

      // Reconstruct and return the path
      const shortestPath = getShortestPath(endNode)
      return { visitedNodesInOrder, shortestPath }
    }

    // Mark as visited
    if (currentNode.type !== "start" && currentNode.type !== "end") {
      visitedNodesInOrder.push(currentNode)
    }

    // Get neighbors
    const neighbors = getNeighbors(currentNode, grid)

    // Add unvisited neighbors to stack
    for (const neighbor of neighbors) {
      const nodeId = `${neighbor.row}-${neighbor.col}`
      if (!visited.has(nodeId)) {
        visited.add(nodeId)
        neighbor.previousNode = currentNode
        stack.push(neighbor)
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
