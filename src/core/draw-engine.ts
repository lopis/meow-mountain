import { GameAssets } from "@/game/game-assets";
import { drawText, DrawTextProps } from "./font";
import { colors } from "./util/color";

class DrawEngine {
  ctx1: CanvasRenderingContext2D;
  ctx2: CanvasRenderingContext2D;
  ctx3: CanvasRenderingContext2D;
  ctx4: CanvasRenderingContext2D;

  // Camera properties
  cameraX = 0;
  cameraY = 0;
  zoom = 1;
  targetCameraX = 0;
  targetCameraY = 0;
  targetZoom = 1;
  cameraLerpSpeed = 0.08; // Adjust for faster/slower camera

  constructor() {
    this.ctx1 = c1.getContext('2d');
    this.ctx2 = c2.getContext('2d');
    this.ctx3 = c3.getContext('2d');
    this.ctx4 = c4.getContext('2d');
    GameAssets.initialize();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('orientationchange', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const aspectRatio = 4 / 3;
    const gameWidth = 1200;
    const gameHeight = Math.round(gameWidth / aspectRatio);
    const ctxs: CanvasRenderingContext2D[] = [this.ctx1, this.ctx2, this.ctx3, this.ctx4];
    for (const ctx of ctxs) {
      ctx.canvas.width = gameWidth;
      ctx.canvas.height = gameHeight;
      ctx.imageSmoothingEnabled = false;
    }
  }

  get canvasWidth() {
    return this.ctx2.canvas.width;
  }

  get canvasHeight() {
    return this.ctx2.canvas.height;
  }

  drawText(textProps: DrawTextProps, context?: CanvasRenderingContext2D) {
    drawText(context || this.ctx2, textProps);
  }

  static drawImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    mirrored?: boolean,
    imgWidth?: number,
    imgWeight?: number,
  ) {
    if (mirrored) {
      ctx.save();
      ctx.scale(-1, 1);
      x = -x - (imgWidth ?? img.width);
    }
    ctx.drawImage(
      img,
      x,
      y,
      imgWidth ?? img.width,
      imgWeight ?? img.height,
    );
    if (mirrored) {
      ctx.restore();
    }
  }

  drawBackgroundImage(
    img: HTMLImageElement,
    x: number,
    y: number,
    mirrored?: boolean,
    imgWidth?: number,
    imgHeight?: number,
  ) {
    DrawEngine.drawImage(this.ctx1, img, x, y, mirrored, imgWidth, imgHeight);
  }

  drawForegroundImage(
    img: HTMLImageElement,
    x: number,
    y: number,
    mirrored?: boolean,
    imgWidth?: number,
    imgHeight?: number,
  ) {
    DrawEngine.drawImage(this.ctx2, img, x, y, mirrored, imgWidth, imgHeight);
  }

  drawUIImage(
    img: HTMLImageElement,
    x: number,
    y: number,
    mirrored?: boolean,
    imgWidth?: number,
    imgHeight?: number,
  ) {
    DrawEngine.drawImage(this.ctx3, img, x, y, mirrored, imgWidth, imgHeight);
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
    this.targetZoom = zoom;
    const cx = this.canvasWidth / 2 - 32;
    const cy = this.canvasHeight / 2 - 64;
    this.ctx1.setTransform(
      this.zoom, 0, 0, this.zoom,
      cx - this.cameraX * this.zoom,
      cy - this.cameraY * this.zoom,
    );
    if (immediate) {
      this.cameraX = x;
      this.cameraY = y;
      this.zoom = zoom;
    }
  }

  updateCamera() {
    this.cameraX += (this.targetCameraX - this.cameraX) * this.cameraLerpSpeed;
    this.cameraY += (this.targetCameraY - this.cameraY) * this.cameraLerpSpeed;
    this.zoom += (this.targetZoom - this.zoom) * this.cameraLerpSpeed;
  }

  resetCamera() {
    this.ctx1.setTransform(1, 0, 0, 1, 0, 0);
  }

  clear() {
    this.resetCamera();
    this.ctx1.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx1.fillStyle = colors.green2;
    this.ctx1.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx2.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx3.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  /**
   * Converts world coordinates to screen coordinates, accounting for camera transforms
   * @param worldX World X coordinate
   * @param worldY World Y coordinate
   * @param zoom Current zoom level (defaults to 7, matching game state)
   * @returns Screen coordinates { x, y }
   */
  worldToScreen(worldX: number, worldY: number, zoom: number = 7): { x: number; y: number } {
    const cx = this.canvasWidth / 2 - 32;
    const cy = this.canvasHeight / 2 - 64;

    return {
      x: cx + (worldX - this.cameraX) * zoom,
      y: cy + (worldY - this.cameraY) * zoom
    };
  }
}

export const drawEngine = new DrawEngine();
