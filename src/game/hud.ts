import { drawEngine } from "@/core/draw-engine";
import { HEART } from "@/core/font";
import { colors } from "@/core/util/color";

const MAX_LIVES = 7;

export class HUD {
  constructor() {}

  draw() {
    this.drawLives();
  }

  drawLives() {
    const x = c3.width / 2;
    const y = 16;
    const text = HEART.repeat(7);
    const size = 5;
    
    const boxW = (text.length * 6 + 1) * size;
    const boxH = 7 * size;
    drawEngine.ctx3.fillStyle = colors.black;
    drawEngine.ctx3.fillRect(x - boxW / 2, y - size, boxW, boxH);
    drawEngine.drawText({text, x, y, color: colors.purple3, textAlign: "center", size}, drawEngine.ctx3);
  }
}
