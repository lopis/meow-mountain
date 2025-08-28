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
    const x = drawEngine.ctx3.canvas.width / 2;
    const y = drawEngine.ctx3.canvas.height - 40;
    const fontSize = 3;
    const boxWidth = 300;
    const boxHeight = fontSize * 10;
    drawEngine.ctx3.clearRect(
      x - boxWidth / 2,
      y - boxHeight / 2,
      boxWidth,
      boxHeight,
    );

    const actionLabel = this.actions.currentAction;
    if (actionLabel) {
      // Draw background box
      drawEngine.ctx3.fillStyle = colors.purple2;
      drawEngine.ctx3.fillRect(
        x - boxWidth / 2,
        y - boxHeight / 2,
        boxWidth,
        boxHeight,
      );

      // Draw text
      drawEngine.drawText({
        text: `(x) ${actionLabel}`,
        x,
        y,
        color: colors.blue4,
        textAlign: "center",
        textBaseline: "middle",
        size: fontSize
      }, drawEngine.ctx3);
    }
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
