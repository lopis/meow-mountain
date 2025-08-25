import { drawEngine } from "@/core/draw-engine";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";

export class Icon {
  constructor(
    public readonly icon: HTMLImageElement,
    public col: number,
    public row: number,
    public type: string,
  ) { }

  draw() {
    drawEngine.drawForegroundImage(this.icon, this.col * CELL_WIDTH, this.row * CELL_HEIGHT);
  }
}
