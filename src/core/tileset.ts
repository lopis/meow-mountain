import { generateImageData } from '@/game/sprite-loader';

export class NewTileset<T extends string | number> {
  public animations: Record<T, HTMLImageElement[]> = {} as Record<T, HTMLImageElement[]>;
  public tileSize = 16;

  constructor(
    public spriteSheet: { size: number, palette: string[]; data: Record<T, string[]> },
  ) {
    // Process each animation (sit, idle, walk, run, etc.)
    for (const [animationName, frames] of Object.entries(spriteSheet.data) as [T, string[]][]) {
      this.animations[animationName] = frames.map((frameData: string) => 
        generateImageData(frameData, spriteSheet.palette)
      );
    }
    this.tileSize = spriteSheet.size;
  }
}
