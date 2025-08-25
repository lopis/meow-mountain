import { colors } from "@/core/util/color";
import { GameMap } from "./game-map";
import { Player } from "./entities/player";
import { drawEngine } from "@/core/draw-engine";

const pixelColors: Record<string, string> = {
  'oak': colors.green1,
  'spruce': colors.green2,
  'house': colors.blue4,
  'field': colors.yellow1,
  'statue': colors.purple3,
  'unseen': colors.green3,
  'default': colors.yellow2,
};

export class MiniMap {
  private lastUpdate = 0;
  private updateInterval = 100; // Update once per second

  constructor(private map: GameMap) { }

  update(timeElapsed: number) {
    this.lastUpdate += timeElapsed;
  }

  public draw(player: Player) {
    if (this.lastUpdate < this.updateInterval) {
      return;
    }

    this.lastUpdate = 0;
    const ctx = drawEngine.ctx3;
    const mapSize = 160;
    const x = ctx.canvas.width - mapSize - 10; // Bottom right with 10px margin
    const y = ctx.canvas.height - mapSize - 10;

    // Clear previous minimap
    ctx.clearRect(x, y, mapSize, mapSize);

    // Draw map pixels
    for (let my = 0; my < mapSize; my++) {
      for (let mx = 0; mx < mapSize; mx++) {
        const cell = this.map.grid[my][mx];

        if (!cell.seen) {
          ctx.fillStyle = pixelColors.unseen;
        } else {
          ctx.fillStyle = pixelColors[cell.content?.type || 'default'] ?? pixelColors.default;
        }

        ctx.fillRect(x + mx, y + my, 1, 1);
      }
    }

    if (player.col >= 0 && player.col < mapSize && player.row >= 0 && player.row < mapSize) {
      ctx.fillStyle = colors.purple4;
      ctx.beginPath();
      ctx.arc(x + player.col, y + player.row, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
