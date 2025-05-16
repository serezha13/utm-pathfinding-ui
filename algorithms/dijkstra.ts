import type { Node } from "@/types/node"
import { getNeighbors, getAllNodes, sortNodesByDistance } from "@/lib/grid-utils"

export function runDijkstraAlgorithm(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
): { visitedNodesInOrder: Node[]; shortestPath: Node[] | null } {
  const visitedNodesInOrder: Node[] = []

  // Initialize start node
  startNode.distance = 0

  // Get all nodes
  const unvisitedNodes = getAllNodes(grid)

  while (unvisitedNodes.length) {
    // Sort unvisited nodes by distance
    sortNodesByDistance(unvisitedNodes)

    // Get node with lowest distance
    const closestNode = unvisitedNodes.shift()!

    // If we're trapped (distance is infinity)
    if (closestNode.distance === Number.POSITIVE_INFINITY) {
      return { visitedNodesInOrder, shortestPath: null }
    }

    // Mark as visited
    closestNode.isVisited = true
    if (closestNode.type !== "start" && closestNode.type !== "end") {
      visitedNodesInOrder.push(closestNode)
    }

    // If we reached the end node
    if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
      // Update the end node's previousNode reference
      endNode.previousNode = closestNode.previousNode

      // Reconstruct and return the path
      const shortestPath = getShortestPath(endNode)
      return { visitedNodesInOrder, shortestPath }
    }

    // Update all neighbors
    updateUnvisitedNeighbors(closestNode, grid)
  }

  // No path found
  return { visitedNodesInOrder, shortestPath: null }
}

// Update unvisited neighbors
function updateUnvisitedNeighbors(node: Node, grid: Node[][]): void {
  const neighbors = getNeighbors(node, grid)
  for (const neighbor of neighbors) {
    if (!neighbor.isVisited) {
      neighbor.distance = node.distance + 1
      neighbor.previousNode = node
    }
  }
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
