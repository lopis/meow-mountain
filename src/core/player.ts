import { CatStates, GameAssets } from "@/game/game-assets";
import { GameObject } from "./game-object";
import { controls } from "./controls";

export class Player extends GameObject<CatStates> {
  constructor(
    public x: number,
    public y: number,
  ) {
    super(GameAssets.cat, x, y, 'idle');
  }

  update(timeElapsed: number) {
    // Update position based on inputs
    controls.queryController();

    if (controls.isUp) {
      this.y -= 2 * timeElapsed / 1000;
      this.animation = 'walk';
    } else if (controls.isDown) {
      this.y += 2 * timeElapsed / 1000;
      this.animation = 'walk';
    }
    
    if (controls.isLeft) {
      this.x -= 2 * timeElapsed / 1000;
      this.animation = 'walk';
      this.mirrored = true;
    } else if (controls.isRight) {
      this.x += 2 * timeElapsed / 1000;
      this.animation = 'walk';
      this.mirrored = false;
    }

    if (!controls.isMoving) {
      this.animation = 'idle';
    }
  }
}
