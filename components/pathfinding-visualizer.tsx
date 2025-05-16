"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, Trash2, Flag, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ROWS, COLS, type Node, type Algorithm } from "@/types/node";
import {
  createInitialGrid,
  getNodeAt,
  cloneGrid,
  isAdjacentToPath,
} from "@/lib/grid-utils";
import { runAStarAlgorithm } from "@/algorithms/a-star";
import { runDijkstraAlgorithm } from "@/algorithms/dijkstra";
import { runDFSAlgorithm } from "@/algorithms/dfs";

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState<Node[][]>([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [currentTool, setCurrentTool] = useState<"wall" | "start" | "end">(
    "wall"
  );
  const [isRunning, setIsRunning] = useState(false);
  const [startNodePos, setStartNodePos] = useState({
    row: Math.floor(ROWS / 2),
    col: Math.floor(COLS / 5),
  });
  const [endNodePos, setEndNodePos] = useState({
    row: Math.floor(ROWS / 2),
    col: Math.floor((COLS * 4) / 5),
  });
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<Algorithm>("astar");

  // Refs to store animation data
  const animationTimeoutsRef = useRef<number[]>([]);

  // Initialize grid
  useEffect(() => {
    setGrid(createInitialGrid(ROWS, COLS));
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach((timeout) =>
        window.clearTimeout(timeout)
      );
    };
  }, []);

  // Reset grid
  const resetGrid = useCallback(() => {
    // Clear any running animations
    animationTimeoutsRef.current.forEach((timeout) =>
      window.clearTimeout(timeout)
    );
    animationTimeoutsRef.current = [];

    setGrid(createInitialGrid(ROWS, COLS));
    setStartNodePos({ row: Math.floor(ROWS / 2), col: Math.floor(COLS / 5) });
    setEndNodePos({
      row: Math.floor(ROWS / 2),
      col: Math.floor((COLS * 4) / 5),
    });
    setIsRunning(false);
  }, []);

  // Clear path
  const clearPath = useCallback(() => {
    if (isRunning) return;

    // Clear any running animations
    animationTimeoutsRef.current.forEach((timeout) =>
      window.clearTimeout(timeout)
    );
    animationTimeoutsRef.current = [];

    setGrid((prevGrid) => {
      return prevGrid.map((row) =>
        row.map((node) => {
          if (node.type === "visited" || node.type === "path") {
            return {
              ...node,
              type: "empty",
              isVisited: false,
              distance: Number.POSITIVE_INFINITY,
              previousNode: null,
              fScore: Number.POSITIVE_INFINITY,
              gScore: Number.POSITIVE_INFINITY,
              hScore: Number.POSITIVE_INFINITY,
            };
          }
          return {
            ...node,
            isVisited: false,
            distance: Number.POSITIVE_INFINITY,
            previousNode: null,
            fScore: Number.POSITIVE_INFINITY,
            gScore: Number.POSITIVE_INFINITY,
            hScore: Number.POSITIVE_INFINITY,
          };
        })
      );
    });
  }, [isRunning]);

  // Handle mouse down
  const handleMouseDown = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;

      setIsMousePressed(true);

      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        const node = newGrid[row][col];

        // If we're trying to place a start/end node, first remove the existing one
        if (currentTool === "start") {
          newGrid[startNodePos.row][startNodePos.col].type = "empty";
          node.type = "start";
          setStartNodePos({ row, col });
        } else if (currentTool === "end") {
          newGrid[endNodePos.row][endNodePos.col].type = "empty";
          node.type = "end";
          setEndNodePos({ row, col });
        } else if (node.type !== "start" && node.type !== "end") {
          // Toggle wall
          node.type = node.type === "wall" ? "empty" : "wall";
        }

        return newGrid;
      });
    },
    [
      currentTool,
      endNodePos.col,
      endNodePos.row,
      isRunning,
      startNodePos.col,
      startNodePos.row,
    ]
  );

  // Handle mouse enter
  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isMousePressed || isRunning) return;

      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        const node = newGrid[row][col];

        if (currentTool === "start") {
          newGrid[startNodePos.row][startNodePos.col].type = "empty";
          node.type = "start";
          setStartNodePos({ row, col });
        } else if (currentTool === "end") {
          newGrid[endNodePos.row][endNodePos.col].type = "empty";
          node.type = "end";
          setEndNodePos({ row, col });
        } else if (node.type !== "start" && node.type !== "end") {
          node.type = "wall";
        }

        return newGrid;
      });
    },
    [
      currentTool,
      endNodePos.col,
      endNodePos.row,
      isMousePressed,
      isRunning,
      startNodePos.col,
      startNodePos.row,
    ]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsMousePressed(false);
  }, []);

  // Animate algorithm visualization
  const animateAlgorithm = useCallback(
    (visitedNodesInOrder: Node[], shortestPath: Node[] | null) => {
      // Clear any existing timeouts
      animationTimeoutsRef.current.forEach((timeout) =>
        window.clearTimeout(timeout)
      );
      animationTimeoutsRef.current = [];

      // Animate visited nodes
      for (let i = 0; i < visitedNodesInOrder.length; i++) {
        const timeout = window.setTimeout(() => {
          const node = visitedNodesInOrder[i];
          setGrid((prevGrid) => {
            const newGrid = [...prevGrid];
            if (
              newGrid[node.row][node.col].type !== "start" &&
              newGrid[node.row][node.col].type !== "end"
            ) {
              newGrid[node.row][node.col] = {
                ...newGrid[node.row][node.col],
                type: "visited",
                previousNode: node.previousNode,
              };
            }
            return newGrid;
          });
        }, 10 * i);
        animationTimeoutsRef.current.push(timeout);
      }

      // Animate shortest path if found
      if (shortestPath) {
        for (let i = 0; i < shortestPath.length; i++) {
          const timeout = window.setTimeout(() => {
            const node = shortestPath[i];
            setGrid((prevGrid) => {
              const newGrid = [...prevGrid];
              if (
                newGrid[node.row][node.col].type !== "start" &&
                newGrid[node.row][node.col].type !== "end"
              ) {
                newGrid[node.row][node.col] = {
                  ...newGrid[node.row][node.col],
                  type: "path",
                };
              }
              return newGrid;
            });
          }, 10 * visitedNodesInOrder.length + 50 * i);
          animationTimeoutsRef.current.push(timeout);
        }
      }

      // Set running state to false after animation completes
      const finalTimeout = window.setTimeout(() => {
        setIsRunning(false);
      }, 10 * visitedNodesInOrder.length + (shortestPath ? 50 * shortestPath.length : 0));
      animationTimeoutsRef.current.push(finalTimeout);
    },
    []
  );

  // Visualize the selected algorithm
  const visualizeAlgorithm = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    clearPath();

    // Create a deep copy of the grid to work with
    const gridCopy = cloneGrid(grid);
    const startNode = getNodeAt(gridCopy, startNodePos.row, startNodePos.col);
    const endNode = getNodeAt(gridCopy, endNodePos.row, endNodePos.col);

    let result: { visitedNodesInOrder: Node[]; shortestPath: Node[] | null };

    // Run the selected algorithm
    switch (selectedAlgorithm) {
      case "astar":
        result = runAStarAlgorithm(gridCopy, startNode, endNode, endNodePos);
        break;
      case "dijkstra":
        result = runDijkstraAlgorithm(gridCopy, startNode, endNode);
        break;
      case "dfs":
        result = runDFSAlgorithm(gridCopy, startNode, endNode);
        break;
      default:
        result = { visitedNodesInOrder: [], shortestPath: null };
    }

    // Animate the algorithm visualization
    animateAlgorithm(result.visitedNodesInOrder, result.shortestPath);
  }, [
    animateAlgorithm,
    clearPath,
    endNodePos,
    grid,
    isRunning,
    selectedAlgorithm,
    startNodePos.row,
    startNodePos.col,
  ]);

  // Get node class
  const getNodeClass = useCallback(
    (node: Node): string => {
      switch (node.type) {
        case "wall":
          return "bg-gray-800";
        case "start":
          return (
            "bg-green-500" +
            (isAdjacentToPath(node, grid) ? " ring-2 ring-yellow-400" : "")
          );
        case "end":
          return (
            "bg-red-500" +
            (isAdjacentToPath(node, grid) ? " ring-2 ring-yellow-400" : "")
          );
        case "visited":
          return "bg-blue-300 animate-pulse";
        case "path":
          return "bg-yellow-400";
        default:
          return "bg-white";
      }
    },
    [grid]
  );

  // Get algorithm description
  const getAlgorithmDescription = useCallback((): string => {
    switch (selectedAlgorithm) {
      case "astar":
        return "A* este un algoritm de căutare de tipul „cel mai bun primul” care utilizează o euristică pentru a găsi cea mai scurtă cale.";
      case "dijkstra":
        return "Algoritmul lui Dijkstra găsește cea mai scurtă cale explorând toate căile posibile.";
      case "dfs":
        return "Depth-First Search Căutarea explorează cât mai departe posibil de-a lungul fiecărei ramuri înainte de a se întoarce.";
      default:
        return "";
    }
  }, [selectedAlgorithm]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap gap-4 justify-center mb-4 w-full max-w-2xl">
        <div className="flex-1 min-w-[200px]">
          <Select
            value={selectedAlgorithm}
            onValueChange={(value) => setSelectedAlgorithm(value as Algorithm)}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="astar">A* Algorithm</SelectItem>
              <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
              <SelectItem value="dfs">Depth-First Search</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={visualizeAlgorithm}
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Vizualizați algoritmul
        </Button>

        <Button
          onClick={clearPath}
          disabled={isRunning}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Square className="h-4 w-4" />
          Resetare
        </Button>

        <Button
          onClick={resetGrid}
          disabled={isRunning}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Resetare Grid
        </Button>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        {getAlgorithmDescription()}
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-4">
        <Button
          onClick={() => setCurrentTool("wall")}
          disabled={isRunning}
          variant={currentTool === "wall" ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Instrument de perete
        </Button>
        <Button
          onClick={() => setCurrentTool("start")}
          disabled={isRunning}
          variant={currentTool === "start" ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Flag className="h-4 w-4" />
          Punct de start
        </Button>
        <Button
          onClick={() => setCurrentTool("end")}
          disabled={isRunning}
          variant={currentTool === "end" ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Punct de sfârșit
        </Button>
      </div>

      <div className="flex flex-col items-center border border-gray-300 rounded-md overflow-hidden">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((node, nodeIdx) => (
              <div
                key={nodeIdx}
                className={cn(
                  "w-5 h-5 border border-gray-200",
                  getNodeClass(node)
                )}
                onMouseDown={() => handleMouseDown(rowIdx, nodeIdx)}
                onMouseEnter={() => handleMouseEnter(rowIdx, nodeIdx)}
                onMouseUp={handleMouseUp}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>Realizat de Sergiu Loghin, Tudor Coretchi și Russ Ion, grupa TI-231 F/R.</p>
      </div>
    </div>
  );
}
