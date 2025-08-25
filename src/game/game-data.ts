import { MAX_LIVES } from "./constants";

export class GameData {
  paused = false;
  lives = MAX_LIVES;
  superstition = 0;

  constructor() {
  }
}

export const gameData = new GameData();
