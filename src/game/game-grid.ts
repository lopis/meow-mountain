export interface Drawable {
  col: number;
  row: number;
  draw: () => void;
  type: string;
  update?: (timeElapsed: number) => void;
}

interface Cell {
  x: number; // X coordinate of the cell
  y: number; // Y coordinate of the cell
  content: Drawable | undefined;
}

export class GameGrid {
  private grid: Cell[][]; // 2D array to represent the grid

  // This class will manage the game grid, including its dimensions and any grid-related logic.
  constructor(public width: number, public height: number) {
    this.grid = this.createEmptyGrid();
  }

  createEmptyGrid(): Cell[][] {
    const grid: Cell[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({ x, y, content: undefined });
      }
      grid.push(row);
    }
    return grid;
  }
}
