import { GameGrid } from "./game-grid";

export class GameData {
  grid: GameGrid;
  paused = false;

  constructor() {
    this.grid = new GameGrid(10, 10);
  }
}

export const gameData = new GameData();
