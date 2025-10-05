import { drawEngine } from '@/core/draw-engine';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';
import { colors } from '@/core/util/color';

export class MagicCircleAnimation {
  animationTimer = 0;
  static animationDuration = 1500;
  progress = 0;
  cx: number;
  cy: number;
  isDone = false;

  constructor(
    private x: number,
    private y: number,
  ) {
    this.cx = this.x + CELL_WIDTH / 2;
    this.cy = this.y + CELL_HEIGHT / 2;
  }

  update(timeElapsed: number) {
    this.animationTimer += timeElapsed;
    this.progress = this.animationTimer / MagicCircleAnimation.animationDuration;

    if (this.progress >= 1) {
      this.isDone = true;
    }
  }

  draw() {
    if (this.isDone) return;

    const animationProgress = (3 * this.progress) % 1;
    
    const maxWidth = c2.width / drawEngine.zoom;
    const maxHeight = c2.height / drawEngine.zoom;
    const rx = maxWidth * animationProgress;
    const ry = maxHeight * animationProgress;
    drawEngine.drawCircumference(
      drawEngine.ctx1,
      this.cx,
      this.cy,
      rx,
      ry,
      colors.white,
      8,
    );
  }
}
