import { GameAssets } from '@/game/game-assets';
import { drawEngine } from '@/core/draw-engine';
import { CELL_WIDTH, CELL_HEIGHT } from '@/game/constants';
import { GameStaticObject } from '@/core/game-static-object';

export class Tree extends GameStaticObject {
  private neighbors: { top: boolean; bottom: boolean; left: boolean; right: boolean } = {
    top: false,
    bottom: false,
    left: false,
    right: false,
  };

  constructor(
    public x: number,
    public y: number,
    treeType: 'oak' | 'spruce',
  ) {
    super(
      GameAssets[treeType],
      x,
      y,
      treeType,
    );
  }

  setNeighbors(neighbors: { top: boolean; bottom: boolean; left: boolean; right: boolean }) {
    this.neighbors = neighbors;
  }

  draw() {
    if (this.neighbors.right) {
      drawEngine.drawBackgroundImage(this.img, Math.round(this.offsetX + CELL_WIDTH / 2), this.offsetY - CELL_HEIGHT / 2);
    }
    super.draw();
  }
}
