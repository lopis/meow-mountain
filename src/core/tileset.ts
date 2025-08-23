/**
 * Tileset class receives a path to a spritesheet and
 * splits it into tiles and animations.
 */
export class Tileset<T extends string> {
  public animations: Record<T, HTMLImageElement[]> = {} as Record<T, HTMLImageElement[]>;

  constructor(
    private spriteSheetPath: string,
    public tileSize: number = 16,
    private animationNames: T[] = [], // Each row in the spritesheet is an animation
  ) {
    this.loadSpriteSheet();
  }

  /**
   * Loads the image into memory and splits it into tiles and animations.
   */
  private loadSpriteSheet() {
    // Load the sprite sheet image from the provided path
    const image = new Image();
    image.src = this.spriteSheetPath;

    // Wait for the image to load before processing
    image.onload = () => {
      this.processSpriteSheet(image);
    };
  }

  /**
   * Processes the loaded sprite sheet image and splits it into tiles and animations.
   */
  private processSpriteSheet(image: HTMLImageElement) {
    // Split the image into tiles and animations
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match the sprite sheet
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the sprite sheet onto the canvas
    ctx.drawImage(image, 0, 0);

    // Extract tiles and animations from the canvas
    this.extractTilesAndAnimations(ctx);
  }

  private extractTilesAndAnimations(ctx: CanvasRenderingContext2D) {
    // Loop through the rows and columns of the sprite sheet
    for (let row = 0; row < this.animationNames.length; row++) {
      const animationName = this.animationNames[row];
      const frames: HTMLImageElement[] = [];
      const colCount = ctx.canvas.width / this.tileSize;

      for (let col = 0; col < colCount; col++) {
        const tile = ctx.getImageData(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
        const tileCanvas = document.createElement("canvas");
        tileCanvas.width = this.tileSize;
        tileCanvas.height = this.tileSize;
        const tileCtx = tileCanvas.getContext("2d");
        if (tileCtx) {
          tileCtx.putImageData(tile, 0, 0);
            const img = new Image();
            img.src = tileCanvas.toDataURL();
            frames.push(img);
        }
      }

      // Store the extracted animation frames
      this.animations[animationName] = frames;
    }
  }
}
