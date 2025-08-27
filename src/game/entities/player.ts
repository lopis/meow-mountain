import { CatStates, GameAssets } from "@/game/game-assets";
import { GameObject } from "../../core/game-object";
import { controls } from "../../core/controls";
import { GameMap } from "../game-map";
import { CELL_HEIGHT, CELL_WIDTH, statues } from "../constants";
import { on } from "@/core/event";

export class Player extends GameObject<CatStates> {
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

    on('teleport', () => {
      this.setPos(statues.heart.x, statues.heart.y + 1);
    });
  }

  update(timeElapsed: number) {
    super.update(timeElapsed);
    super.updatePositionSmoothly(timeElapsed);

    if (!this.moving.y && controls.inputDirection.y) {
      const newRow = this.row + controls.inputDirection.y;
      if (newRow >= 0 && newRow < this.map.rowCount && !this.map.grid[newRow][this.col].content) {
        this.animation = 'run';
        this.moving.y = controls.inputDirection.y;
        this.targetPos.y += controls.inputDirection.y * CELL_HEIGHT;
        this.row = newRow;
      }
    }

    if (!this.moving.x && controls.inputDirection.x) {
      this.mirrored = controls.isLeft;
      const newCol = this.col + controls.inputDirection.x;
      if (newCol >= 0 && newCol < this.map.colCount && !this.map.grid[this.row][newCol].content) {
        this.animation = 'run';
        this.moving.x = controls.inputDirection.x;
        this.targetPos.x += controls.inputDirection.x * CELL_WIDTH;
        this.col = newCol;
      }
    }

    if (!this.moving.x && !this.moving.y) {
      this.animation = 'idle';
    }

    // DEBUG
    coords.innerText = `${this.col},${this.row}`;
  }
}
