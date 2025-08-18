import { State } from "@/core/state";
import { GameGrid } from "@/game/game-grid";

export class Level implements State {
  readonly grid: GameGrid;

  constructor(
    readonly levelNumber: number = 1,
    readonly height: number,
    readonly width: number,
  ) {
    this.grid = new GameGrid(width, height);
  }

  onUpdate (timeElapsed: number) {
    
  };

  onEnter?: Function | undefined;
  
  onLeave?: Function | undefined;
}
