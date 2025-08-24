import { Asset, GameAssets } from "@/game/game-assets";
import { drawEngine } from "@/core/draw-engine";
import { CELL_WIDTH, CELL_HEIGHT } from "@/game/constants";
import { GameObject } from "@/core/game-object";

export class Tree extends GameObject<Asset> {
  private image: HTMLImageElement;
  private neighbors: { top: boolean; bottom: boolean; left: boolean; right: boolean } = {
    top: false,
    bottom: false,
    left: false,
    right: false,
  };

  constructor(
    public x: number,
    public y: number,
    assetType: Asset,
  ) {
    super(GameAssets.assets, x, y, assetType, assetType);
    this.image = GameAssets.assets.animations[assetType][0];
  }

  setNeighbors(neighbors: { top: boolean; bottom: boolean; left: boolean; right: boolean }) {
    this.neighbors = neighbors;
  }

  draw() {
    if (this.neighbors.right) {
      drawEngine.drawForegroundImage(this.image, Math.round(this.x + CELL_WIDTH / 2), this.y - CELL_HEIGHT / 2);
    }

    drawEngine.drawForegroundImage(this.image, this.x, this.y);
  }
}
