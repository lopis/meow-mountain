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

export class GameMap {
  private map: Cell[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.map = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => (
        { x, y, content: new Tree(x * CELL_WIDTH, y * CELL_HEIGHT + CELL_HEIGHT/2 * (x % 2), 'spruce') }
      ))
    );
  }

  set(x: number, y: number, content: GameObject<any> | Tree | null) {
    if (this.map[y] && this.map[y][x]) {
      this.map[y][x].content = content;
    }
  }

  get(x: number, y: number): GameObject<any> | Tree | null {
    if (this.isValidCell(x, y)) {
      return this.map[y][x].content;
    }
    return null;
  }

  isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  isEmpty(x: number, y: number): boolean {
    return this.isValidCell(x, y) && this.map[y][x].content === null;
  }

  canMoveTo(x: number, y: number): boolean {
    return this.isValidCell(x, y) && this.isEmpty(x, y);
  }

  // Convert screen coordinates to grid coordinates
  screenToGrid(screenX: number, screenY: number): { x: number, y: number } {
    return {
      x: Math.floor(screenX / CELL_WIDTH),
      y: Math.floor(screenY / CELL_HEIGHT)
    };
  }

  // Convert grid coordinates to screen coordinates
  gridToScreen(gridX: number, gridY: number): { x: number, y: number } {
    return {
      x: gridX * CELL_WIDTH,
      y: gridY * CELL_HEIGHT
    };
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
