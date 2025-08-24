import { drawEngine } from "@/core/draw-engine";
import { HEART } from "@/core/font";
import { colors } from "@/core/util/color";
import { MiniMap } from "./mini-map";
import { GameMap } from "./game-map";
import { Player } from "./entities/player";
import { Actions } from "./actions";

const MAX_LIVES = 7;

export class HUD {
  miniMap: MiniMap;
  player: Player;
  actions: Actions;

  constructor(map: GameMap, player: Player, actions: Actions) {
    this.miniMap = new MiniMap(map);
    this.player = player;
    this.actions = actions;
  }

  update(timeElapsed: number) {
    this.miniMap.update(timeElapsed);
  }

  draw() {
    this.drawLives();
    this.drawActions();
    this.miniMap.draw(this.player);
  }

  drawActions() {
    const x = drawEngine.ctx3.canvas.width / 2;
    const y = drawEngine.ctx3.canvas.height - 40;
    const fontSize = 3;
    const width = 200;
    const height = fontSize * 7;
    const padding = 10;
    drawEngine.ctx3.clearRect(
      x - width / 2 - padding,
      y - height - padding,
      width + padding * 2,
      height + padding * 2
    );

    const actionLabel = this.actions.currentAction;
    if (actionLabel) {
      debugger;

      // Draw background box
      const boxPadding = 10;
      drawEngine.ctx3.fillStyle = colors.purple2;
      drawEngine.ctx3.fillRect(
        x - width / 2 - boxPadding,
        y - fontSize * 8 - boxPadding,
        width + boxPadding * 2,
        fontSize * 8 + boxPadding * 2
      );

      // Draw text
      drawEngine.drawText({
        text: `(x) ${actionLabel}`,
        x,
        y,
        color: colors.blue4,
        textAlign: "center",
        textBaseline: "bottom",
        size: fontSize
      }, drawEngine.ctx3);
    }
  }

  drawLives() {
    const x = c3.width / 2;
    const y = 16;
    const text = HEART.repeat(MAX_LIVES);
    const size = 5;

    const boxW = (text.length * 6 + 1) * size;
    const boxH = MAX_LIVES * size;
    drawEngine.ctx3.fillStyle = colors.purple0;
    drawEngine.ctx3.fillRect(x - boxW / 2, y - size, boxW, boxH);
    drawEngine.drawText({ text, x, y, color: colors.purple4, textAlign: "center", size }, drawEngine.ctx3);
  }
}
