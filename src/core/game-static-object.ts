import { CELL_HEIGHT, CELL_WIDTH } from '@/game/constants';
import { Drawable } from '@/game/Drawable';
import { drawEngine } from './draw-engine';

export class GameStaticObject implements Drawable {
  public col: number;
  public row: number;
  public offsetX: number;
  public offsetY: number;

  constructor(
    public img: HTMLImageElement,
    public x: number,
    public y: number,
    public type: string,
  ) {
    this.col = Math.ceil(x / CELL_WIDTH);
    this.row = Math.ceil(y / CELL_HEIGHT);
    this.offsetX = x - Math.round((img.width - CELL_WIDTH) / 2);
    this.offsetY = y - Math.round((img.height - CELL_HEIGHT) / 2);
  }

  draw() {
    drawEngine.drawBackgroundImage(this.img, this.offsetX, this.offsetY);
  }
}
