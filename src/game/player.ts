import { CatStates, GameAssets } from "@/game/game-assets";
import { GameObject } from "../core/game-object";
import { controls } from "../core/controls";
import { GameMap } from "./game-map";
import { Drawable } from "./game-grid";
import { CELL_HEIGHT, CELL_WIDTH } from "./constants";

export class Player extends GameObject<CatStates> implements Drawable {
  speed = 80;
  moving = { x: 0, y: 0};
  target;
  map: GameMap;
  type = 'cat';

  constructor(x: number, y: number, map: GameMap) {
    super(GameAssets.cat, x, y, 'cat', 'idle');
    this.target = { x, y };
    this.map = map;
  }

  update(timeElapsed: number) {
    this.animationTime += timeElapsed;

    if (!this.moving.y && controls.inputDirection.y) {
      const newGy = this.row + controls.inputDirection.y;
      if (newGy >= 0 && newGy < this.map.height && !this.map.map[newGy][this.col].content) {
        this.animation = 'run';
        this.moving.y = controls.inputDirection.y;
        this.target.y += controls.inputDirection.y * CELL_HEIGHT;
        this.row = newGy;
      }
    }

    if (!this.moving.x && controls.inputDirection.x) {
      const newGx = this.col + controls.inputDirection.x;
      if (newGx >= 0 && newGx < this.map.width && !this.map.map[this.row][newGx].content) {
        this.animation = 'run';
        this.moving.x = controls.inputDirection.x;
        this.target.x += controls.inputDirection.x * CELL_WIDTH;
        this.col = newGx;
        this.mirrored = controls.isLeft;
      }
    }

    if (!this.moving.x && !this.moving.y) {
      this.animation = 'idle';
    }

    for (const axis of ['x', 'y'] as const) {
      if (this[axis] !== this.target[axis]) {
        const d = this.target[axis] - this[axis];
        const step = Math.sign(d) * this.speed * timeElapsed / 1000;
        if (Math.abs(step) >= Math.abs(d)) {
          this[axis] = this.target[axis];
        } else {
          this[axis] += step;
        }
      } else {
        this.moving[axis] = 0;
        this[axis] = Math.round(this[axis]);
      }
    }
  }
}
