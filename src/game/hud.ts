import { drawEngine } from '@/core/draw-engine';
import { colors } from '@/core/util/color';
import { easeInOutSine } from '@/core/util/util';
import { MiniMap } from './mini-map';
import { GameMap } from './game-map';
import { Player } from './entities/player';
import { Actions } from './actions';
import { GameData } from './game-data';
import { MAX_LIVES, MAX_MAGIC, NOTIFICATION_DURATION } from './constants';
import { DialogBox } from './dialog-box';
import { MAGIC, EMPTY_HEART, FULL_HEART, ONE_THIRD_HEART, TWO_THIRDS_HEART } from '@/core/font';
import { on } from '@/core/event';

export class HUD {
  miniMap: MiniMap;
  dialogBox: DialogBox;
  renderSuperstition = false;
  renderLives = false;
  renderMagic = false;

  constructor(
    public map: GameMap,
    public player: Player,
    public actions: Actions,
    public gameData: GameData,
  ) {
    this.miniMap = new MiniMap(map);
    this.dialogBox = new DialogBox();

    on('enable-scratch', () => {
      this.renderLives = true;
    });

    on('not-enough-magic', () => {
      this.renderMagic = true;
    });
  }

  update(timeElapsed: number) {
    this.miniMap.update(timeElapsed);
  }

  draw() {
    this.renderLives && this.drawLives();
    this.renderMagic && this.drawMagic();
    this.drawGoals();
    this.renderSuperstition && this.drawSuperstition();
    this.drawActions();
    this.drawLookingAt();
    this.renderLives && this.miniMap.draw(this.player);
    this.dialogBox.draw();
  }

  drawActions() {
    const actions = this.actions.actions;
    if (!actions.some(action => action.enabled)) {
      return;
    }

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
        textAlign: 'center',
        textBaseline: 'middle',
        size: 7
      }, drawEngine.ctx3);

      // Draw key binding
      drawEngine.drawText({
        text: `key: ${index + 1}`,
        x: x + boxWidth / 2,
        y: y + 70,
        color: colors.black,
        textAlign: 'center',
        textBaseline: 'middle',
        size: 3
      }, drawEngine.ctx3);

      // Draw action name
      drawEngine.drawText({
        text: type,
        x: x + boxWidth / 2,
        y: y + 95,
        color: colors.black,
        textAlign: 'center',
        textBaseline: 'middle',
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

  drawMagic() {
    let x = c3.width - 16;
    const y = 16;
    const fullMagic = this.gameData.magic;
    const emptyMagic = this.gameData.maxMagic - this.gameData.magic;
    const noMagic = MAX_MAGIC - this.gameData.maxMagic;

    const size = 5;
    const charWidth = (5 + 1) * size;

    const boxW = MAX_MAGIC * charWidth + size;
    const boxH = 7 * size;
    drawEngine.ctx3.fillStyle = colors.yellow1;
    drawEngine.ctx3.fillRect(x - boxW + size, y, boxW, boxH);

    let text = MAGIC.repeat(fullMagic);
    x -= text.length * charWidth;
    drawEngine.drawText({ text, x: x + size, y: y + size, color: colors.blue1, size }, drawEngine.ctx3);

    text = MAGIC.repeat(emptyMagic);
    x -= text.length * charWidth;
    drawEngine.drawText({ text, x: x + size, y: y + size, color: colors.blue3, size }, drawEngine.ctx3);

    text = MAGIC.repeat(noMagic);
    x -= text.length * charWidth;
    drawEngine.drawText({ text, x: x + size, y: y + size, color: colors.yellow2, size }, drawEngine.ctx3);
  }

  drawGoals() {
    const goals = this.gameData.goals;

    const baseX = 16;
    const y = 16 + 7 * 5 + 10; // lives y  + lives box height + margin
    const boxW = 420;
    const boxH = 5 * 7 + 30;
    const size = 3;
    const padding = 5;
    const animationDuration = 200; // 100ms slide animation
    
    goals.filter(goal => goal.time > 0)
    .forEach((goal, i) => {
      const {label, time} = goal;
      const boxY = y + (boxH + padding) * i;
      
      // Calculate animation offset based on remaining time
      let offsetX = 0;
      const distanceX = boxW + baseX;
      if (time > NOTIFICATION_DURATION - animationDuration) {
        // Sliding in from left (appearing)
        const progress = (NOTIFICATION_DURATION - time) / animationDuration;
        const easedProgress = easeInOutSine(progress, 0, 1);
        offsetX = -distanceX * (1 - easedProgress);
      } else if (time < animationDuration) {
        // Sliding out to left (disappearing)
        const progress = time / animationDuration;
        const easedProgress = easeInOutSine(progress, 0, 1);
        offsetX = -distanceX * (1 - easedProgress);
      }
      
      const x = baseX + offsetX;
      
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

  drawLookingAt() {
    if (!this.map.playerLookingAt) {
      return;
    }
    
    const cell = this.map.getLookingAt();
    if (cell?.content?.name) {
      const boxWidth = 350;
      const boxHeight = 35;
      drawEngine.ctx3.fillStyle = colors.purple5;
      drawEngine.ctx3.fillRect(
        c3.width / 2 - boxWidth / 2 + 4,
        c3.height - 170 - 6 * 3 - 4,
        boxWidth - 8,
        boxHeight + 8,
      );
      drawEngine.ctx3.fillStyle = colors.yellow2;
      drawEngine.ctx3.fillRect(
        c3.width / 2 - boxWidth / 2,
        c3.height - 170 - 6 * 3,
        boxWidth,
        boxHeight,
      );
      drawEngine.drawText({
        text: `${cell.content.name}`,
        x: c3.width / 2,
        y: c3.height - 170,
        textAlign: 'center',
        textBaseline: 'middle',
        color: colors.purple4,
        size: 3,
      }, drawEngine.ctx3);
    }
  }
}
