import { drawEngine } from "@/core/draw-engine";
import { colors } from "@/core/util/color";
import { MiniMap } from "./mini-map";
import { GameMap } from "./game-map";
import { Player } from "./entities/player";
import { Actions } from "./actions";
import { GameData } from "./game-data";
import { MAX_LIVES } from "./constants";
import { DialogBox } from "./dialog-box";
import { EMPTY_HEART, FULL_HEART, ONE_THIRD_HEART, TWO_THIRDS_HEART } from "@/core/font";

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
    this.drawLives();
    this.drawGoals();
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
    const startX = Math.round((drawEngine.ctx3.canvas.width - totalWidth) / 2);
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

  drawLives() {
    const x = 16;
    const y = 16;
    const fullHearts = Math.floor(this.gameData.lives);
    const emptyHearts = Math.floor(MAX_LIVES - this.gameData.lives);
    const halfHearts = MAX_LIVES - fullHearts - emptyHearts;
    const partialHearts = this.gameData.lives - fullHearts;
    const text = FULL_HEART.repeat(fullHearts)
      + (partialHearts > 0.3 ? TWO_THIRDS_HEART : ONE_THIRD_HEART).repeat(halfHearts)
      + EMPTY_HEART.repeat(emptyHearts);
    const size = 5;

    const boxW = (text.length * 6 + 1) * size;
    const boxH = 7 * size;
    drawEngine.ctx3.fillStyle = colors.purple0;
    drawEngine.ctx3.fillRect(x, y, boxW, boxH);
    drawEngine.drawText({ text, x: x + size, y: y + size, color: colors.purple4, size }, drawEngine.ctx3);
  }

  drawGoals() {
    const goals = this.gameData.goals;

    const x = 16;
    const y = 16 + 7 * 5 + 10; // lives y  + lives box height + margin
    const boxW = 420; // lives box width
    const boxH = 5 * 7 + 30;
    const size = 3;
    const padding = 5;
    
    goals.forEach((goal, i) => {
      const {label, time} = goal;
      const boxY = y + (boxH + padding) * i;
      drawEngine.ctx3.fillStyle = colors.purple4;
      drawEngine.ctx3.fillRect(x, boxY, boxW, boxH);
      drawEngine.drawText(
      {
        text: 'NEW GOAL',
        x: x + size + padding,
        y: boxY + padding,
        color: colors.white,
        size: size + 1,
      }, drawEngine.ctx3
    );
      drawEngine.drawText(
        {
          text: label,
          x: x + size + padding + 20,
          y: 35 + boxY + padding,
          color: colors.black,
          size
        }, drawEngine.ctx3
      );
    });
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
