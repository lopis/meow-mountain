import { colors } from "@/core/util/color";
import { GameMap } from "./game-map";
import { Player } from "./player";
import { drawEngine } from "@/core/draw-engine";
import { Tree } from "./tree";

export class MiniMap {
  private lastUpdate = 0;
  private updateInterval = 100; // Update once per second

  constructor(private map: GameMap) {}

  update(timeElapsed: number, player: Player) {
    this.lastUpdate += timeElapsed;
    
    if (this.lastUpdate >= this.updateInterval) {
      this.lastUpdate = 0;
      this.draw(player);
    }
  }

  private draw(player: Player) {
    const ctx = drawEngine.ctx3;
    const mapSize = 160;
    const x = ctx.canvas.width - mapSize - 10; // Bottom right with 10px margin
    const y = ctx.canvas.height - mapSize - 10;
    
    // Clear previous minimap
    ctx.clearRect(x, y, mapSize, mapSize);
    
    // Draw map pixels
    for (let my = 0; my < mapSize; my++) {
      for (let mx = 0; mx < mapSize; mx++) {
        const cell = this.map.map[my][mx];
        
        if (!cell.seen) {
          ctx.fillStyle = colors.green3; // Dark green for unseen cells
        } else {
          ctx.fillStyle = cell.content?.type == 'oak' ? colors.green1
          : cell.content?.type == 'spruce' ? colors.green2
          : cell.content?.type == 'house' ? colors.blue4
          : cell.content?.type == 'field' ? colors.yellow1
          : colors.yellow2;
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
