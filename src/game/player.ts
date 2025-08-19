import { CatStates, GameAssets } from "@/game/game-assets";
import { GameObject } from "../core/game-object";
import { controls } from "../core/controls";

export class Player extends GameObject<CatStates> {
  private speed = 30;

  constructor(
    public x: number,
    public y: number,
  ) {
    super(GameAssets.cat, x, y, 'idle');
  }

  update(timeElapsed: number) {
    this.animationTime += timeElapsed;

    // Update position based on inputs
    controls.queryController();

    if (controls.isUp) {
      this.y -= this.speed * timeElapsed / 1000;
      this.animation = 'walk';
    } else if (controls.isDown) {
      this.y += this.speed * timeElapsed / 1000;
      this.animation = 'walk';
    }
    
    if (controls.isLeft) {
      this.x -= this.speed * timeElapsed / 1000;
      this.animation = 'walk';
      this.mirrored = true;
    } else if (controls.isRight) {
      this.x += this.speed * timeElapsed / 1000;
      this.animation = 'walk';
      this.mirrored = false;
    }

    if (!controls.isMoving) {
      this.animation = 'idle';
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
    }

  }
}
