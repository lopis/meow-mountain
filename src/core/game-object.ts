import { drawEngine } from "./draw-engine";
import { Tileset } from "./tileset";

export class GameObject<T extends string> {
  private animationTime = 0;
  private animationDuration = 250; // Duration for each animation frame in milliseconds

  constructor(
    private readonly tileset: Tileset<T>,
    private readonly animation: T,
    public x: number,
    public y: number,
  ){}

  draw(timeElapsed: number) {
    this.animationTime += timeElapsed;
    const animation = this.tileset.animations[this.animation];
    const animationFrame = Math.floor(this.animationTime / this.animationDuration) % animation.length;
    
    if (animation[animationFrame]) {
      drawEngine.drawImage(
        animation[animationFrame],
        this.x,
        this.y
      );
    }
  }

}
