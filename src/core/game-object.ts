import { CELL_WIDTH, CELL_HEIGHT } from "@/game/constants";
import { drawEngine } from "./draw-engine";
import { Tileset } from "./tileset";

export class GameObject<T extends string> {
  protected animationTime = 0;
  private animationDuration = 150; // Duration for each animation frame in milliseconds
  public col: number;
  public row: number;

  constructor(
    private readonly tileset: Tileset<T>,
    public x: number,
    public y: number,
    public type: string,
    protected animation: T,
    protected mirrored: boolean = false,
  ) {
    this.col = Math.ceil(x / CELL_WIDTH);
    this.row = Math.ceil(y / CELL_HEIGHT);
  }

  update(timeElapsed: number) {
    this.animationTime += timeElapsed;
  }

  draw() {
    const animation = this.tileset.animations[this.animation];
    const animationFrame = Math.floor(this.animationTime / this.animationDuration) % animation.length;

    if (animation[animationFrame]) {
      drawEngine.drawForegroundImage(
        animation[animationFrame],
        this.x - (this.tileset.tileSize - CELL_WIDTH) / 2,
        this.y - (this.tileset.tileSize - CELL_HEIGHT) / 2,
        this.mirrored,
      );
    }
  }

}
