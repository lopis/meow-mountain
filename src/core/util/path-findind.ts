export interface Position {
  x: number;
  y: number;
}

export interface PathNode {
  pos: Position;
  distance: number;
  previous?: PathNode;
}

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
  if (start.y < 0 || start.y >= rowCount || start.x < 0 || start.x >= colCount) return null;

  // Check if starting position matches
  if (matchCondition(grid[start.y][start.x], start.x, start.y)) {
    return start;
  }

  const visited = new Set<string>();
  const queue: PathNode[] = [{ pos: start, distance: 0 }];
  visited.add(`${start.x},${start.y}`);

  // Directions: north, south, east, west
  const directions = [
    { x: 0, y: -1 }, // north
    { x: 0, y: 1 },  // south
    { x: 1, y: 0 },  // east
    { x: -1, y: 0 }  // west
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Check all 4 directions
    for (const dir of directions) {
      const newX = current.pos.x + dir.x;
      const newY = current.pos.y + dir.y;
      const newDistance = current.distance + 1;

      // Check bounds and max steps
      if (newX < 0 || newX >= colCount || newY < 0 || newY >= rowCount || newDistance > maxSteps) {
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
