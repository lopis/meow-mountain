import { drawEngine } from "@/core/draw-engine";
import { HEART } from "@/core/font";
import { colors } from "@/core/util/color";
import { MiniMap } from "./mini-map";
import { GameMap } from "./game-map";
import { Player } from "./entities/player";
import { Actions } from "./actions";
import { GameData } from "./game-data";
import { MAX_LIVES } from "./constants";
import { DialogBox } from "./dialog-box";

export class HUD {
  miniMap: MiniMap;
  dialogBox: DialogBox;

  constructor(
    map: GameMap,
    public player: Player,
    public actions: Actions,
    public gameData: GameData,
  ) {
    this.miniMap = new MiniMap(map);
    this.dialogBox = new DialogBox();
  }

  update(timeElapsed: number) {
    this.miniMap.update(timeElapsed);
  }

  draw() {
    HUD.drawLives();
    this.drawSuperstition();
    this.drawActions();
    this.miniMap.draw(this.player);
    this.dialogBox.draw();
  }

  drawActions() {
    const actions = this.actions.actions;
    if (actions.length === 0) return;

    const boxWidth = 120;
    const boxHeight = 120;
    const spacing = 10;
    const totalWidth = actions.length * boxWidth + (actions.length - 1) * spacing;
    const startX = (drawEngine.ctx3.canvas.width - totalWidth) / 2;
    const y = drawEngine.ctx3.canvas.height - boxHeight - 10;

    actions.forEach(({ type, color, symbol, enabled }, index) => {
      const x = startX + index * (boxWidth + spacing);

      // Draw background box
      drawEngine.ctx3.fillStyle = colors.purple0;
      drawEngine.ctx3.fillRect(x, y, boxWidth, boxHeight);

      if (!enabled) {
        return;
      }

      // Draw symbol (large font)
      drawEngine.drawText({
        text: symbol,
        x: x + boxWidth / 2,
        y: y + 30,
        color,
        textAlign: "center",
        textBaseline: "middle",
        size: 7
      }, drawEngine.ctx3);

      // Draw key binding
      drawEngine.drawText({
        text: `key: ${index + 1}`,
        x: x + boxWidth / 2,
        y: y + 70,
        color: colors.black,
        textAlign: "center",
        textBaseline: "middle",
        size: 3
      }, drawEngine.ctx3);

      // Draw action name
      drawEngine.drawText({
        text: type,
        x: x + boxWidth / 2,
        y: y + 95,
        color: colors.black,
        textAlign: "center",
        textBaseline: "middle",
        size: 3
      }, drawEngine.ctx3);
    });
  }

  static drawLives() {
    const x = 16;
    const y = 16;
    const text = HEART.repeat(MAX_LIVES);
    const size = 5;

    const boxW = (text.length * 6 + 1) * size;
    const boxH = 7 * size;
    drawEngine.ctx3.fillStyle = colors.purple0;
    drawEngine.ctx3.fillRect(x, y, boxW, boxH);
    drawEngine.drawText({ text, x: x + size, y: y + size, color: colors.purple4, size }, drawEngine.ctx3);
  }

  drawSuperstition() {
    const text = 'superstition';
    const size = 3;
    const charWidth = 5;
    const padding = 5;
    const boxW = (text.length * size + padding * 2) * charWidth;
    const boxH = 35;
    const x = Math.round(c3.width / 2 - boxW / 2);
    const y = 16;

    // Background
    drawEngine.ctx3.fillStyle = colors.purple0;
    drawEngine.ctx3.fillRect(x, y, boxW, 62);

    drawEngine.ctx3.fillStyle = colors.blue5;
    drawEngine.ctx3.fillRect(x + padding, y + padding, boxW - 2 * padding, boxH - 2 * padding);

    drawEngine.ctx3.fillStyle = this.gameData.superstition > 0.9 ? colors.purple4 : colors.blue2;
    const barSize = Math.round(this.gameData.superstition * (boxW - 2 * padding) / 3) * 3;
    drawEngine.ctx3.fillRect(x + padding, y + padding, barSize, boxH - 2 * padding);

    drawEngine.drawText({ text, x: c3.width / 2, y: y + boxH + size, color: colors.blue5, size, textAlign: 'center' }, drawEngine.ctx3);
  }
}
