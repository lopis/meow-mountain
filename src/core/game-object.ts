import { drawEngine } from "./draw-engine";
import { Tileset } from "./tileset";

export class GameObject<T extends string> {
  protected animationTime = 0;
  private animationDuration = 150; // Duration for each animation frame in milliseconds

  constructor(
    private readonly tileset: Tileset<T>,
    public x: number,
    public y: number,
    protected animation: T,
    protected mirrored: boolean = false,
  ){}

  draw(timeElapsed: number) {
    const animation = this.tileset.animations[this.animation];
    const animationFrame = Math.floor(this.animationTime / this.animationDuration) % animation.length;
    
    if (animation[animationFrame]) {
      drawEngine.drawForegroundImage(
        animation[animationFrame],
        this.x,
        this.y,
        this.mirrored,
      );
    }
  }

}
