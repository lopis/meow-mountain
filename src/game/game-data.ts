import { GameGrid } from "./game-grid";

export class GameData {
  grid: GameGrid;

  constructor() {
    this.grid = new GameGrid(10, 10);
  }
}
