export interface Position {
  x: number;
  y: number;
}

export interface PathNode {
  position: Position;
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
  const height = grid.length;
  const width = grid[0]?.length || 0;

  if (width === 0 || height === 0) return null;
  if (start.y < 0 || start.y >= height || start.x < 0 || start.x >= width) return null;

  // Check if starting position matches
  if (matchCondition(grid[start.y][start.x], start.x, start.y)) {
    return start;
  }

  const visited = new Set<string>();
  const queue: PathNode[] = [{ position: start, distance: 0 }];
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
      const newX = current.position.x + dir.x;
      const newY = current.position.y + dir.y;
      const newDistance = current.distance + 1;

      // Check bounds and max steps
      if (newX < 0 || newX >= width || newY < 0 || newY >= height || newDistance > maxSteps) {
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
        position: { x: newX, y: newY },
        distance: newDistance,
        previous: current
      });
    }
  }

  return null; // No matching cell found within maxSteps
}

/**
 * Breadth-first search that returns the full path to the target
 * @param grid - 2D array representing the game map
 * @param start - Starting position {x, y}
 * @param matchCondition - Function that returns true if the cell satisfies the condition
 * @param maxSteps - Maximum number of steps to search
 * @returns Array of positions representing the path, or null if not found
 */
export function findPath<T>(
  grid: T[][],
  start: Position,
  matchCondition: (cell: T, x: number, y: number) => boolean,
  maxSteps: number
): Position[] | null {
  const height = grid.length;
  const width = grid[0]?.length || 0;

  if (width === 0 || height === 0) return null;
  if (start.y < 0 || start.y >= height || start.x < 0 || start.x >= width) return null;

  // Check if starting position matches
  if (matchCondition(grid[start.y][start.x], start.x, start.y)) {
    return [start];
  }

  const visited = new Set<string>();
  const queue: PathNode[] = [{ position: start, distance: 0 }];
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
      const newX = current.position.x + dir.x;
      const newY = current.position.y + dir.y;
      const newDistance = current.distance + 1;

      // Check bounds and max steps
      if (newX < 0 || newX >= width || newY < 0 || newY >= height || newDistance > maxSteps) {
        continue;
      }

      const key = `${newX},${newY}`;
      if (visited.has(key)) {
        continue;
      }

      visited.add(key);

      const newNode: PathNode = {
        position: { x: newX, y: newY },
        distance: newDistance,
        previous: current
      };

      // Check if this cell matches our condition
      if (matchCondition(grid[newY][newX], newX, newY)) {
        // Reconstruct path
        const path: Position[] = [];
        let node: PathNode | undefined = newNode;
        while (node) {
          path.unshift(node.position);
          node = node.previous;
        }
        return path;
      }

      // Add to queue for further exploration
      queue.push(newNode);
    }
  }

  return null; // No path found within maxSteps
}

/**
 * Find the nearest empty cell (where content is null)
 */
export function findNearestEmptyCell<T extends { content: any }>(
  grid: T[][],
  start: Position,
  maxSteps: number
): Position | null {
  return findNearestMatch(
    grid,
    start,
    (cell) => cell.content === null,
    maxSteps
  );
}

/**
 * Find the nearest cell of a specific type
 */
export function findNearestCellOfType<T extends { content: { type?: string } | null }>(
  grid: T[][],
  start: Position,
  targetType: string,
  maxSteps: number
): Position | null {
  return findNearestMatch(
    grid,
    start,
    (cell) => cell.content?.type === targetType,
    maxSteps
  );
}

/**
 * Example usage:
 * 
 * // Find nearest house for a villager
 * const housePosition = findNearestCellOfType(
 *   gameMap.map,
 *   { x: villager.col, y: villager.row },
 *   'house',
 *   20
 * );
 * 
 * // Find nearest empty space
 * const emptySpace = findNearestEmptyCell(
 *   gameMap.map,
 *   { x: player.col, y: player.row },
 *   10
 * );
 * 
 * // Custom condition - find nearest tree that's not surrounded by other trees
 * const isolatedTree = findNearestMatch(
 *   gameMap.map,
 *   { x: player.col, y: player.row },
 *   (cell, x, y) => {
 *     if (cell.content?.type !== 'tree') return false;
 *     // Check if tree has empty neighbors
 *     const hasEmptyNeighbor = [
 *       gameMap.map[y-1]?.[x]?.content === null,
 *       gameMap.map[y+1]?.[x]?.content === null,
 *       gameMap.map[y]?.[x-1]?.content === null,
 *       gameMap.map[y]?.[x+1]?.content === null
 *     ].some(isEmpty => isEmpty);
 *     return hasEmptyNeighbor;
 *   },
 *   15
 * );
 */
