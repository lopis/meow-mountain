import { GameMap } from "./game-map";
import { Player } from "./player";
import { drawEngine } from "@/core/draw-engine";

export class MiniMap {
  private lastUpdate = 0;
  private updateInterval = 1000; // Update once per second

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
          ctx.fillStyle = '#232f25'; // Dark green for unseen cells
        } else {
          ctx.fillStyle = cell.content ? '#6e8e41' : '#926839'; // Light green for trees, brown for empty
        }
        
        ctx.fillRect(x + mx, y + my, 1, 1);
      }
    }
    
    // Draw player as small circle
    const playerGridX = Math.floor(player.x / 10);
    const playerGridY = Math.floor(player.y / 10);
    
    if (playerGridX >= 0 && playerGridX < mapSize && playerGridY >= 0 && playerGridY < mapSize) {
      ctx.fillStyle = '#ea2264'; // Red
      ctx.beginPath();
      ctx.arc(x + playerGridX, y + playerGridY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
