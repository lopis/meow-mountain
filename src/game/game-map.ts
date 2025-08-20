import { GameObject } from "@/core/game-object";
import { Tree } from "./tree";
import { drawEngine } from "@/core/draw-engine";
import { colors } from "@/core/util/color";

interface Cell {
  x: number;
  y: number;
  content: GameObject<any> | Tree | null;
}

export const CELL_WIDTH = 10;
export const CELL_HEIGHT = 10;

type Path = [{x: number, y: number}, {x: number, y: number}, number];
type Circle = {x: number, y: number, r: number};

// Seeded random number generator for deterministic randomness
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

const paths: Path[] = [
  [
    {x: 80, y: 80}, // from
    {x: 2, y: 90}, // to
    3, // width
  ],
]

const clearings: Circle[] = [
  {x: 80, y: 80, r: 8}
]

export class GameMap {
  map: Cell[][];
  private rng: SeededRandom;

  constructor(public readonly width: number, public readonly height: number, seed: number = 12345) {
    this.rng = new SeededRandom(seed);
    
    this.map = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => (
        { x, y, content: new Tree(x * CELL_WIDTH, y * CELL_HEIGHT + CELL_HEIGHT/2 * (x % 2), 'spruce') }
      ))
    );

    // Clear paths with jitter
    for (const path of paths) {
      this.clearPathWithJitter(path[0], path[1], path[2]);
    }

    // Clear circular areas with jitter
    for (const clearing of clearings) {
      this.clearCircleWithJitter(clearing.x, clearing.y, clearing.r);
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
      const jitterAmount = 0.8; // Adjust for more/less randomness
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
        const jitterRadius = this.rng.range(-3, 3);
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
    for (const row of this.map) {
      for (const cell of row) {
        if (cell.content) {
          // Draw the content only if it's close to the
          // camera position (cx, cy);
          if (
            Math.abs(cell.content.x - cx) < 200 &&
            Math.abs(cell.content.y - cy) < 120
          ) {
            cell.content.draw(0);
          }
        }
      }
    }
  }
}
