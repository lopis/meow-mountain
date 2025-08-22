import { AssetType, GameAssets } from "@/game/game-assets";
import { drawEngine } from "@/core/draw-engine";
import { CELL_HEIGHT, CELL_WIDTH } from "./game-map";

export class Tree {
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
    type: AssetType,
  ) {
    this.image = GameAssets.assets.animations[type][0];
  }

  setNeighbors(neighbors: { top: boolean; bottom: boolean; left: boolean; right: boolean }) {
    this.neighbors = neighbors;
  }

  draw() {
    // Draw additional visuals based on neighbors
    // if (this.neighbors.bottom) {
    //   drawEngine.drawBackgroundImage(this.image, this.x, this.y + CELL_HEIGHT/2);
    // }
    // if (this.neighbors.right) {
    //   drawEngine.drawBackgroundImage(this.image, Math.round(this.x + CELL_WIDTH/2), this.y - CELL_HEIGHT/2);
    // }

    drawEngine.drawBackgroundImage(this.image, this.x, this.y);
  }
}
