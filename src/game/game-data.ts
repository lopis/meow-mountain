import { on } from "@/core/event";
import { MAX_LIVES } from "./constants";

export class GameData {
  cutscene = true;
  lives = MAX_LIVES;
  superstition = 0;
  superstitionCooldown = 0;

  constructor() {
    on('scared', () => {
      this.superstition = Math.min(1, this.superstition + 0.005);
      this.superstitionCooldown = 5000;
    });

    on('cutscene-start', () => {
      this.cutscene = true;
    });

    on('cutscene-end', () => {
      this.cutscene = false;
    });
  }

  update(timeElapsed: number) {
    this.superstitionCooldown -= timeElapsed;
    if (this.superstition > 0 && this.superstitionCooldown <= 0) {
      this.superstition -= (1 / timeElapsed) * 0.001;
    }
  }
}

export const gameData = new GameData();
