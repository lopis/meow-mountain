import { GameAssets } from "@/game/game-assets";
import { drawText, DrawTextProps } from "./font";

class DrawEngine {
  context: CanvasRenderingContext2D;

  constructor() {
    this.context = c2d.getContext('2d');
    this.context.imageSmoothingEnabled = false;
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

  /**
   * Sets the camera position and zoom level.
   * @param x The x-coordinate of the object where the camera should focus
   * @param y The y-coordinate of the object where the camera should focus
   * @param zoom The zoom level of the camera
   */
  setCamera(x: number, y: number, zoom: number = 1) {
    const cx = this.canvasWidth / 2 - 32;
    const cy = this.canvasHeight / 2 - 64;
    this.context.setTransform(
      zoom, 0, 0, zoom,
      cx - x * zoom,
      cy - y * zoom,
    );
  }

  resetCamera() {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
  }
}

export const drawEngine = new DrawEngine();
