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
      
      // Create straight line path between from and to
      const dx = Math.sign(to.x - from.x);
      const dy = Math.sign(to.y - from.y);
      
      let x = from.x;
      let y = from.y;
      
      // Clear cells along the path with width
      while (x !== to.x || y !== to.y) {
        // Clear area around the current position
        const halfWidth = Math.floor(width / 2);
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
        
        if (x !== to.x) x += dx;
        if (y !== to.y) y += dy;
      }
      
      // Clear the destination cell with width
      const halfWidth = Math.floor(width / 2);
      for (let ox = -halfWidth; ox <= halfWidth; ox++) {
        for (let oy = -halfWidth; oy <= halfWidth; oy++) {
          const clearX = to.x + ox;
          const clearY = to.y + oy;
          if (clearY >= 0 && clearY < this.map.length && 
              clearX >= 0 && clearX < this.map[0].length) {
            this.map[clearY][clearX].content = null;
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
            Math.abs(cell.content.x - cx) < 130 &&
            Math.abs(cell.content.y - cy) < 90
          ) {
            cell.content.draw(0);
          }
        }
      }
    }
  }
}
