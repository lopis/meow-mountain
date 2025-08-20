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

const paths: Path[] = [
  [
    {x: 80, y: 80}, // from
    {x: 2, y: 90}, // to
    3, // width
  ],
  [
    {x: 80, y: 79}, // from
    {x: 80, y: 81}, // to
    8, // width
  ]
]

export class GameMap {
  map: Cell[][];

  constructor(public readonly width: number, public readonly height: number) {
    this.map = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => (
        { x, y, content: new Tree(x * CELL_WIDTH, y * CELL_HEIGHT + CELL_HEIGHT/2 * (x % 2), 'spruce') }
      ))
    );

    // Clear paths
    for (const path of paths) {
      const from = path[0];
      const to = path[1];
      const width = path[2];
      
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
        // Clear area around the current position
        for (let ox = -halfWidth; ox <= halfWidth; ox++) {
          for (let oy = -halfWidth; oy <= halfWidth; oy++) {
            const clearX = x + ox;
            const clearY = y + oy;
            if (clearY >= 0 && clearY < this.map.length && 
                clearX >= 0 && clearX < this.map[0].length) {
              this.map[clearY][clearX].content = null;
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
