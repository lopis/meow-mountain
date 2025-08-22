import { GameObject } from "@/core/game-object";
import { Tree } from "./tree";
import { SeededRandom } from "@/core/util/rng";

interface Cell {
  x: number;
  y: number;
  content: GameObject<any> | Tree | null;
  seen?: boolean;
}

export const CELL_WIDTH = 11;
export const CELL_HEIGHT = 11;

type Path = [{x: number, y: number}, {x: number, y: number}, number];
type Circle = {x: number, y: number, r: number};

const paths: Path[] = [
  [{x: 69, y: 100}, {x: 76, y: 113}, 3],
  [{x: 76, y: 113}, {x: 89, y: 114}, 4],
  [{x: 76, y: 113}, {x: 89, y: 114}, 4],
  [{x: 89, y: 114}, {x: 104, y: 86}, 5],
  [{x: 89, y: 114}, {x: 104, y: 86}, 5],
  [{x: 104, y: 86}, {x: 99, y: 59}, 3],
  [{x: 99, y: 59}, {x: 85, y: 46}, 3],
  [{x: 85, y: 46}, {x: 86, y: 28}, 2],
  [{x: 86, y: 28}, {x: 74, y: 38}, 2],
  [{x: 74, y: 38}, {x: 60, y: 39}, 2],
  [{x: 60, y: 39}, {x: 48, y: 30}, 2],
  [{x: 48, y: 30}, {x: 46, y: 43}, 2],
  [{x: 46, y: 43}, {x: 38, y: 61}, 2],
  [{x: 38, y: 61}, {x: 50, y: 73}, 3],
  [{x: 50, y: 73}, {x: 38, y: 84}, 4],
  [{x: 38, y: 84}, {x: 46, y: 123}, 3],
  [{x: 46, y: 123}, {x: 36, y: 133}, 3],
  [{x: 36, y: 133}, {x: 48, y: 141}, 2],
  [{x: 48, y: 141}, {x: 94, y: 133}, 3],
  [{x: 94, y: 133}, {x: 113, y: 109}, 4],
  [{x: 113, y: 109}, {x: 122, y: 74}, 5],
  [{x: 122, y: 74}, {x: 113, y: 56}, 6],

  [{x: 91, y: 52}, {x: 129, y: 29}, 2],

]

const clearings: Circle[] = [
  {x: 64, y: 88, r: 6},
  {x: 75, y: 88, r: 6},
  {x: 69, y: 95, r: 6},

  {x: 129, y: 29, r: 15},
]

export class GameMap {
  map: Cell[][];
  private rng: SeededRandom;

  constructor(public readonly width: number, public readonly height: number) {
    this.rng = new SeededRandom();
    
    this.map = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const tree = new Tree(
          x * CELL_WIDTH - (16 - CELL_WIDTH) / 2, // Adjust x to center the image
          y * CELL_HEIGHT - (16 - CELL_HEIGHT) / 2, // Adjust y to center the image
          'oak'
        );
        return { x, y, content: tree };
      })
    );

    // Clear paths with jitter
    for (const path of paths) {
      this.clearPathWithJitter(path[0], path[1], path[2]);
    }

    // Clear circular areas with jitter
    for (const clearing of clearings) {
      this.clearCircleWithJitter(clearing.x, clearing.y, clearing.r);
    }

    // Calculate neighbor information for each tree
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = this.map[y][x];
        if (cell.content instanceof Tree) {
          const neighbors = {
            top: this.map[y - 1]?.[x]?.content instanceof Tree,
            bottom: this.map[y + 1]?.[x]?.content instanceof Tree,
            left: this.map[y]?.[x - 1]?.content instanceof Tree,
            right: this.map[y]?.[x + 1]?.content instanceof Tree,
          };
          cell.content.setNeighbors(neighbors);
        }
      }
    }
  }

  private clearPathWithJitter(from: {x: number, y: number}, to: {x: number, y: number}, width: number) {
    // Bresenham's line algorithm for any angle
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;
    let err = dx - dy;
    
    let x = from.x;
    let y = from.y;
    
    const halfWidth = Math.floor(width / 2);
    
    while (true) {
      // Add jitter to the clearing area
      const jitterAmount = 1.0; // Adjust for more/less randomness
      const jitterX = Math.round(this.rng.range(-jitterAmount, jitterAmount));
      const jitterY = Math.round(this.rng.range(-jitterAmount, jitterAmount));
      
      // Clear area around the current position with jitter
      for (let ox = -halfWidth; ox <= halfWidth; ox++) {
        for (let oy = -halfWidth; oy <= halfWidth; oy++) {
          const clearX = x + ox + jitterX;
          const clearY = y + oy + jitterY;
          if (clearY >= 0 && clearY < this.map.length && 
              clearX >= 0 && clearX < this.map[0].length) {
            // Add probability for partial clearing to create natural edges
            if (this.rng.next() > 0.1) { // 90% chance to clear
              this.map[clearY][clearX].content = null;
            }
          }
        }
      }
      
      // Check if we've reached the destination
      if (x === to.x && y === to.y) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  private clearCircleWithJitter(centerX: number, centerY: number, radius: number) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Add jitter to radius for natural edge
        const jitterRadius = this.rng.range(-radius, radius) / 6;
        const adjustedRadius = radius + jitterRadius;
        
        if (distance <= adjustedRadius) {
          // Add probability for partial clearing near edges
          const edgeDistance = adjustedRadius - distance;
          const clearProbability = Math.min(1, edgeDistance / 2 + 0.7);
          
          if (this.rng.next() < clearProbability) {
            this.map[y][x].content = null;
          }
        }
      }
    }
  }

  set(x: number, y: number, content: GameObject<any> | Tree | null) {
    if (this.map[y] && this.map[y][x]) {
      this.map[y][x].content = content;
    }
  }

  draw(cx: number, cy: number) {
    const radius = 150; // Define the radius for the circular area
    const radiusSquared = radius * radius;

    for (const row of this.map) {
      for (const cell of row) {
        const dx = cell.x * CELL_WIDTH - cx;
        const dy = cell.y * CELL_HEIGHT - cy;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared <= radiusSquared) {
          cell?.content?.draw(0);
          cell.seen = true;
          // drawEngine.ctx1.strokeStyle = cell.content ? colors.green0 : colors.green1;
          // drawEngine.ctx1.strokeRect(cell.x * CELL_WIDTH+1, cell.y * CELL_HEIGHT+1, CELL_WIDTH-2, CELL_HEIGHT-2);
        }
      }
    }
  }
}
