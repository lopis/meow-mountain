import { AssetType, GameAssets } from "@/game/game-assets";
import { drawEngine } from "@/core/draw-engine";

export class Tree {
  private image: HTMLImageElement;

  constructor(
    public x: number,
    public y: number,
    type: AssetType,
  ) {
    this.image = GameAssets.assets.animations[type][0];
  }

  draw() {
    drawEngine.drawBackgroundImage(this.image, this.x, this.y);
  }
}
