import { GameAssets } from "@/game/game-assets";
import { drawText, DrawTextProps } from "./font";
import { easeInOutSine } from "./util/util";

class DrawEngine {
  ctx1: CanvasRenderingContext2D;
  ctx2: CanvasRenderingContext2D;
  ctx3: CanvasRenderingContext2D;
  
  // Camera properties
  private cameraX = 0;
  private cameraY = 0;
  private targetCameraX = 0;
  private targetCameraY = 0;
  private cameraLerpSpeed = 0.08; // Adjust for faster/slower camera

  constructor() {
    this.ctx1 = c1.getContext('2d');
    this.ctx2 = c2.getContext('2d');
    this.ctx3 = c3.getContext('2d');
    GameAssets.initialize();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('orientationchange', () => this.resizeCanvas());
  }

  init () {

  }

  resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.ctx1.canvas.width = width;
    this.ctx1.canvas.height = height;
    this.ctx2.canvas.width = width;
    this.ctx2.canvas.height = height;
    this.ctx3.canvas.width = width;
    this.ctx3.canvas.height = height;
    this.ctx1.imageSmoothingEnabled = false;
    this.ctx2.imageSmoothingEnabled = false;
    this.ctx3.imageSmoothingEnabled = false;
  }

  get canvasWidth() {
    return this.ctx2.canvas.width;
  }

  get canvasHeight() {
    return this.ctx2.canvas.height;
  }

  drawText(textProps: DrawTextProps) {
    drawText(this.ctx2, textProps);
  }

  private drawImage(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    mirrored?: boolean,
    width?: number,
    height?: number,
  ) {
    if (mirrored) {
      ctx.save();
      ctx.scale(-1, 1);
      x = -x - (width ?? image.width);
    }
    ctx.drawImage(
      image,
      x,
      y,
      width ?? image.width,
      height ?? image.height,
    );
    if (mirrored) {
      ctx.restore();
    }
  }

  drawBackgroundImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    mirrored?: boolean,
    width?: number,
    height?: number,
  ) {
    this.drawImage(this.ctx1, image, x, y, mirrored, width, height);
  }

  drawForegroundImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    mirrored?: boolean,
    width?: number,
    height?: number,
  ) {
    this.drawImage(this.ctx2, image, x, y, mirrored, width, height);
  }

  drawUIImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    mirrored?: boolean,
    width?: number,
    height?: number,
  ) {
    this.drawImage(this.ctx3, image, x, y, mirrored, width, height);
  }

  /**
   * Sets the camera position and zoom level.
   * @param x The x-coordinate of the object where the camera should focus
   * @param y The y-coordinate of the object where the camera should focus
   * @param zoom The zoom level of the camera
   */
  setCamera(x: number, y: number, zoom: number = 1, immediate = false) {
    this.targetCameraX = x;
    this.targetCameraY = y;
    [this.ctx1, this.ctx2].forEach(ctx => {
      const cx = this.canvasWidth / 2 - 32;
      const cy = this.canvasHeight / 2 - 64;
      ctx.setTransform(
        zoom, 0, 0, zoom,
        cx - this.cameraX * zoom,
        cy - this.cameraY * zoom,
      );
    });
    if (immediate) {
      this.cameraX = x;
      this.cameraY = y;
    }
  }

  updateCamera() {
    this.cameraX += (this.targetCameraX - this.cameraX) * this.cameraLerpSpeed;
    this.cameraY += (this.targetCameraY - this.cameraY) * this.cameraLerpSpeed;
  }

  resetCamera() {
    this.ctx1.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx2.setTransform(1, 0, 0, 1, 0, 0);
  }

  clear() {
    this.resetCamera();
    this.ctx1.clearRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
    this.ctx2.clearRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
  }
}

export const drawEngine = new DrawEngine();
