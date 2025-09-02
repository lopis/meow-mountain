import { colors } from '@/core/util/color';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';

const linePixels = (x0: number, y0: number, x1: number, y1: number): [number, number][] => {
  const pixels: [number, number][] = [];
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, e2: number;

  for (;;) {
    pixels.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
  return pixels;
};

const pentagramVertices = (cx: number, cy: number, pentagramRotation: number, radius: number): [number, number][] => {
  const points: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (2 * Math.PI * (i * 2 % 5)) / 5 - Math.PI / 2 + pentagramRotation;
    const x = Math.round(cx + radius * Math.cos(angle));
    const y = Math.round(cy + radius * Math.sin(angle));
    points.push([x, y]);
  }
  return points;
};

const _rotations = [Math.PI / 2, Math.PI, 3 * Math.PI / 2] as const;

export class PentagramAnimation {
  cx: number;
  cy: number;
  allPixels: [number, number][];
  totalDuration: number;

  constructor(
    public ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    public animationDone: () => void,
    public pentagramRotation: typeof _rotations[number] = 0,
    public radius: number = 12,
    public offset = 0,
    public elapsed = 0,
    public speed = 300,
    public trailLength = 16,
    public cycles = 0,
    public maxCycles = 1,
    public active = true,
  ) {
    this.cx = x + CELL_WIDTH / 2;
    this.cy = y + CELL_HEIGHT / 2;

    const points = pentagramVertices(this.cx, this.cy, pentagramRotation, radius);

    this.allPixels = [];
    for (let i = 0; i < 5; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[(i + 1) % 5];
      this.allPixels.push(...linePixels(x0, y0, x1, y1));
    }
    this.totalDuration = this.allPixels.length * this.maxCycles * 1000 / this.speed;
    console.log('this.totalDuration', this.totalDuration);
  }

  update(timeElapsed: number): void {
    if (!this.active) return;

    this.elapsed += timeElapsed;
    const totalPixelsAdvanced = (this.elapsed / 1000) * this.speed;
    const newOffset = totalPixelsAdvanced % this.allPixels.length;
    
    // Check for cycle completion
    if (newOffset < this.offset) {
      this.cycles++;
      if (this.cycles >= this.maxCycles) {
        this.active = false;
        this.animationDone();
        return;
      }
    }

    console.log(this.elapsed);
    
    this.offset = newOffset;
  }

  draw(): void {
    if (!this.active) return;

    this.ctx.fillStyle = colors.white;
    const effectiveTrailLength = Math.min(this.trailLength, this.offset + 0);
    
    for (let i = 0; i < effectiveTrailLength; i++) {
      const idx = (this.offset - i + this.allPixels.length) % this.allPixels.length;
      const [x, y] = this.allPixels[Math.floor(idx)];
      this.ctx.fillRect(x, y, 1, 1);
    }
  }

  isActive(): boolean {
    return this.active;
  }
}
