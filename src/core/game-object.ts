import { CELL_WIDTH, CELL_HEIGHT } from "@/game/constants";
import { drawEngine } from "./draw-engine";
import { Tileset } from "./tileset";

export class GameObject<T extends string> {
  protected animationTime = 0;
  private animationDuration = 150; // Duration for each animation frame in milliseconds
  public col: number;
  public row: number;
  moving = { x: 0, y: 0 };
  targetPos: { x: number; y: number };

  constructor(
    private readonly tileset: Tileset<T>,
    public x: number,
    public y: number,
    public type: string,
    protected animation: T,
    protected speed: number = 0,
    protected mirrored: boolean = false,
  ) {
    this.col = Math.ceil(x / CELL_WIDTH);
    this.row = Math.ceil(y / CELL_HEIGHT);
    this.animationTime = Math.random() * this.animationDuration;
    this.targetPos = { x: this.x, y: this.y };
  }

  update(timeElapsed: number) {
    this.animationTime += timeElapsed;
  }

  updatePositionSmoothly(timeElapsed: number) {
    for (const axis of ['x', 'y'] as const) {
      if (this[axis] !== this.targetPos[axis]) {
        const d = this.targetPos[axis] - this[axis];
        const step = Math.sign(d) * this.speed * timeElapsed / 1000;
        if (Math.abs(step) >= Math.abs(d)) {
          this[axis] = this.targetPos[axis];
        } else {
          this[axis] += step;
        }
      } else {
        this.moving[axis] = 0;
        this[axis] = Math.round(this[axis]);
      }
    }
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
