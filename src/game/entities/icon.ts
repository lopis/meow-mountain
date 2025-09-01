import { drawEngine } from '@/core/draw-engine';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';

export class Icon {
  x: number;
  y: number;

  constructor(
    public readonly icon: HTMLImageElement,
    public col: number,
    public row: number,
    public type: string,
  ) {
    this.x = Math.round(this.col * CELL_WIDTH + (CELL_WIDTH - this.icon.width) / 2);
    this.y = Math.round(this.row * CELL_HEIGHT + (CELL_HEIGHT - this.icon.height) / 2);
  }

  draw() {
    drawEngine.drawBackgroundImage(this.icon, this.x, this.y);
  }
}
