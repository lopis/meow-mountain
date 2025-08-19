import { GameAssets } from "@/game/game-assets";
import { drawText, DrawTextProps } from "./font";

class DrawEngine {
  context: CanvasRenderingContext2D;

  constructor() {
    this.context = c2d.getContext('2d');
    GameAssets.initialize();
  }

  get canvasWidth() {
    return this.context.canvas.width;
  }

  get canvasHeight() {
    return this.context.canvas.height;
  }

  drawText(textProps: DrawTextProps) {
    drawText(this.context, textProps);
  }
}

export const drawEngine = new DrawEngine();
