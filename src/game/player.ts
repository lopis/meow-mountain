import { CatStates, GameAssets } from "@/game/game-assets";
import { GameObject } from "../core/game-object";
import { controls } from "../core/controls";
import { CELL_HEIGHT, CELL_WIDTH, GameMap } from "./game-map";

export class Player extends GameObject<CatStates> {
  speed = 80;
  moving = { x: 0, y: 0};
  target;
  gx: number; // grid x
  gy: number; // grid y
  map: GameMap;

  constructor(x: number, y: number, map: GameMap) {
    super(GameAssets.cat, x, y, 'cat', 'idle');
    this.target = { x, y };
    this.map = map;
    this.gx = Math.ceil(x / CELL_WIDTH);
    this.gy = Math.ceil(y / CELL_HEIGHT);
  }

  update(timeElapsed: number) {
    this.animationTime += timeElapsed;

    if (!this.moving.y && controls.inputDirection.y) {
      const newGy = this.gy + controls.inputDirection.y;
      if (newGy >= 0 && newGy < this.map.height && !this.map.map[newGy][this.gx].content) {
        this.animation = 'run';
        this.moving.y = controls.inputDirection.y;
        this.target.y += controls.inputDirection.y * CELL_HEIGHT;
        this.gy = newGy;
      }
    }

    if (!this.moving.x && controls.inputDirection.x) {
      const newGx = this.gx + controls.inputDirection.x;
      if (newGx >= 0 && newGx < this.map.width && !this.map.map[this.gy][newGx].content) {
        this.animation = 'run';
        this.moving.x = controls.inputDirection.x;
        this.target.x += controls.inputDirection.x * CELL_WIDTH;
        this.gx = newGx;
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
