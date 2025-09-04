import { Cell } from './types';

export interface Coords {
  col: number;
  row: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface PathNode {
  pos: Position;
  distance: number;
  previous?: PathNode;
}

// Directions: north, south, east, west
const directions: ReadonlyArray<Readonly<{ x: number; y: number }>> = [
  { x: 0, y: -1 }, // north
  { x: 0, y: 1 },  // south
  { x: 1, y: 0 },  // east
  { x: -1, y: 0 }  // west
] as const;

/**
 * Breadth-first search to find the nearest cell that matches a condition
 * @param grid - 2D array representing the game map
 * @param start - Starting position {x, y}
 * @param matchCondition - Function that returns true if the cell satisfies the condition
 * @param maxSteps - Maximum number of steps to search
 * @returns The position of the matching cell, or null if not found
 */
export function findNearestMatch<T>(
  grid: T[][],
  start: Position,
  matchCondition: (cell: T, x: number, y: number) => boolean,
  maxSteps: number
): Position | null {
  const rowCount = grid.length;
  const colCount = grid[0]?.length || 0;

  if (colCount === 0 || rowCount === 0) return null;

  // Check if starting position matches
  if (matchCondition(grid[start.y][start.x], start.x, start.y)) {
    return start;
  }

  const visited = new Set<string>();
  const queue: PathNode[] = [{ pos: start, distance: 0 }];
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check all 4 directions
    for (const dir of directions) {
      const newX = current.pos.x + dir.x;
      const newY = current.pos.y + dir.y;
      const newDistance = current.distance + 1;

      // Check max steps only
      if (newDistance > maxSteps) {
        continue;
      }

      const key = `${newX},${newY}`;
      if (visited.has(key)) {
        continue;
      }

      visited.add(key);

      // Check if this cell matches our condition
      if (matchCondition(grid[newY][newX], newX, newY)) {
        return { x: newX, y: newY };
      }

      // Add to queue for further exploration
      queue.push({
        pos: { x: newX, y: newY },
        distance: newDistance,
        previous: current
      });
    }
  }

  return null; // No matching cell found within maxSteps
}

const toKey = (col: number, row: number) => {
  return `${col},${row}`;
};

// const fromKey = (key): Coords => {
//   const [col ,row] = key.split(',').map(Number);
//   return { col, row };
// };

const reconstructPath = (parents: Record<string, Coords>, start: Coords, goal: Coords) => {
  const path: Coords[] = [];
  let current = goal;
  while (current != start) {
    path.unshift(current);
    current = parents[toKey(current.col, current.row)];
  }
  path.unshift(start);
  return path;
};

/**
 * Uses breadth-first-search to find the shortest path from
 * start to goal, and returns the path as an array of coords.
 * The path will take at most maxSteps steps.
 * This algo assumes that the map is fully enclosed by a boundary
 * so it is not checking whether the coordinates are valid.
 */
export const findShortestPath = (
  grid: Cell[][],
  start: Coords,
  goal: Coords,
  maxSteps = 100,
) => {
  let steps = maxSteps;

  // Start from person A’s position.
  // Keep a queue of cells to explore.
  const queue: Coords[] = [start];

  // Keep a record of which cells you’ve already visited, so you don’t loop back.
  const visited = new Set();

  // Keep a map of coords->cells that keeps track of the paths taken
  const parents: Record<string, Coords> = {};

  while (queue.length !== 0 && steps--) {
    // Get the oldest cell from the queue
    const current = queue.shift() as Coords;
    if (current.col === goal.col && current.row === goal.row) {
      return reconstructPath(parents, start, goal);
    }

    // Check the 4 immediate neighbours
    const neighbours = directions.map(({x, y}) => grid[current.row + y][current.col + x]);
    neighbours.forEach((neighbour) => {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        if (neighbour.content === null || (neighbour.x == goal.col && neighbour.y == goal.row)) {
          parents[toKey(neighbour.x, neighbour.y)] = current;
          queue.push({ col: neighbour.x, row: neighbour.y });
        }
      }
    });
  }
};

