import { CELL_WIDTH, CELL_HEIGHT } from '@/game/constants';
import { drawEngine } from './draw-engine';
import { updatePositionSmoothly, SmoothMovementState } from '../utils/smooth-movement';

interface Tileset<T extends (string | number)> {
  animations: Record<T, HTMLImageElement[]>;
  tileSize: number;
}

export class GameObject<T extends (string | number)> implements SmoothMovementState {
  animationTime = 0;
  animationFrame = 0;
  aD = 150; // Duration for each animation frame in milliseconds
  animationLoop = true;
  col: number;
  row: number;
  moving = { x: 0, y: 0 };
  targetPos: { x: number; y: number };

  constructor(
    private readonly tileset: Tileset<T>,
    public x: number,
    public y: number,
    public type: string,
    public animation: T,
    public speed: number = 0,
    public mirrored: boolean = false,
  ) {
    this.col = Math.ceil(x / CELL_WIDTH);
    this.row = Math.ceil(y / CELL_HEIGHT);
    this.animationTime = Math.random() * this.aD;
    this.targetPos = { x: this.x, y: this.y };
  }

  setPos(col: number, row: number) {
    this.col = col;
    this.row = row;
    this.x = col * CELL_WIDTH;
    this.y = row * CELL_HEIGHT;
    this.targetPos = { x: this.x, y: this.y };
  }

  update(timeElapsed: number) {
    // if (!this.animationLoop && this.animationTime > this.aD * this.tileset.animations[this.animation].length) {
    //   return;
    // }
    this.animationTime += timeElapsed;
    this.animationFrame = Math.floor(this.animationTime / this.aD) % this.tileset.animations[this.animation].length;
  }

  updatePositionSmoothly(timeElapsed: number) {
    updatePositionSmoothly(this, timeElapsed);
    if (this.moving.x !== 0) {
      this.mirrored = this.moving.x < 0;
    }
  }

  draw() {
    const animation = this.tileset.animations[this.animation];
    if (animation[this.animationFrame]) {
      drawEngine.drawBackgroundImage(
        animation[this.animationFrame],
        this.x - (this.tileset.tileSize - CELL_WIDTH) / 2,
        this.y - (this.tileset.tileSize - CELL_HEIGHT) / 2,
        this.mirrored,
      );
    }
  }

}
