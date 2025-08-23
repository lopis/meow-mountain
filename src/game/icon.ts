import { drawEngine } from "@/core/draw-engine";
import { Drawable } from "./game-grid";
import { CELL_HEIGHT, CELL_WIDTH } from "./constants";

export class Icon implements Drawable {
  constructor(
    public readonly icon: HTMLImageElement,
    public x: number,
    public y: number,
    public type: string,
  ) {
    this.x = x * CELL_WIDTH;
    this.y = y * CELL_HEIGHT;
  }

  draw() {
    console.log(this.icon);
    drawEngine.drawForegroundImage(this.icon, this.x, this.y);
  }
}
