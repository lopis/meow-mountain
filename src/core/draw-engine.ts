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

  drawImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    width?: number,
    height?: number,
  ) {    
    this.context.drawImage(
      image,
      x,
      y,
      width ?? image.width,
      height ?? image.height,
    );
  }
}

export const drawEngine = new DrawEngine();
