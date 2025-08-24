import { CatStates, GameAssets } from "@/game/game-assets";
import { GameObject } from "../core/game-object";
import { controls } from "../core/controls";
import { GameMap } from "./game-map";
import { Drawable } from "./game-grid";
import { CELL_HEIGHT, CELL_WIDTH } from "./constants";

export class Player extends GameObject<CatStates> implements Drawable {
  map: GameMap;
  type = 'cat';

  constructor(col: number, row: number, map: GameMap) {
    super(
      GameAssets.cat,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'cat',
      'idle',
      80,
    );
    this.map = map;
  }

  update(timeElapsed: number) {
    super.update(timeElapsed);
    this.updatePositionSmoothly(timeElapsed);

    if (!this.moving.y && controls.inputDirection.y) {
      const newRow = this.row + controls.inputDirection.y;
      if (newRow >= 0 && newRow < this.map.height && !this.map.map[newRow][this.col].content) {
        this.animation = 'run';
        this.moving.y = controls.inputDirection.y;
        this.targetPos.y += controls.inputDirection.y * CELL_HEIGHT;
        this.row = newRow;
      }
    }

    if (!this.moving.x && controls.inputDirection.x) {
      this.mirrored = controls.isLeft;
      const newCol = this.col + controls.inputDirection.x;
      if (newCol >= 0 && newCol < this.map.width && !this.map.map[this.row][newCol].content) {
        this.animation = 'run';
        this.moving.x = controls.inputDirection.x;
        this.targetPos.x += controls.inputDirection.x * CELL_WIDTH;
        this.col = newCol;
      }
    }

    if (!this.moving.x && !this.moving.y) {
      this.animation = 'idle';
    }
  }
}
