import { CatStates, GameAssets } from "@/game/game-assets";
import { GameObject } from "../core/game-object";
import { controls } from "../core/controls";
import { CELL_HEIGHT, CELL_WIDTH } from "./game-map";

export class Player extends GameObject<CatStates> {
  private speed = 50;
  private moving = { x: 0, y: 0}; // direction of movement
  private target; 

  constructor(
    public x: number,
    public y: number,
  ) {
    super(GameAssets.cat, x, y, 'idle');
    this.target = { x, y };
  }

  update(timeElapsed: number) {
    this.animationTime += timeElapsed;

    if (!this.moving.y) {
      this.animation = 'run';
      this.moving.y = controls.inputDirection.y;
      this.target.y += controls.inputDirection.y * CELL_HEIGHT
    }

    if (!this.moving.x) {
      this.animation = 'run';
      this.moving.x = controls.inputDirection.x;
      this.target.x += controls.inputDirection.x * CELL_WIDTH
      this.mirrored = controls.isLeft;
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
