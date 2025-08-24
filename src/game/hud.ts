import { drawEngine } from "@/core/draw-engine";
import { HEART } from "@/core/font";
import { colors } from "@/core/util/color";
import { MiniMap } from "./mini-map";
import { GameMap } from "./game-map";
import { Player } from "./player";

const MAX_LIVES = 7;

export class HUD {
  miniMap: MiniMap;
  player: Player;

  constructor(map: GameMap, player: Player
  ) {
    this.miniMap = new MiniMap(map);
    this.player = player;
  }

  update(timeElapsed: number) {
    this.miniMap.update(timeElapsed);
  }

  draw() {
    this.drawLives();
    this.miniMap.draw(this.player);
  }

  drawLives() {
    const x = c3.width / 2;
    const y = 16;
    const text = HEART.repeat(7);
    const size = 5;

    const boxW = (text.length * 6 + 1) * size;
    const boxH = 7 * size;
    drawEngine.ctx3.fillStyle = colors.purple0;
    drawEngine.ctx3.fillRect(x - boxW / 2, y - size, boxW, boxH);
    drawEngine.drawText({ text, x, y, color: colors.purple4, textAlign: "center", size }, drawEngine.ctx3);
  }
}
