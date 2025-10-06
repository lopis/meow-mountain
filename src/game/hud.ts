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
import { GameEvent } from './event-manifest';
import { Village } from './entities/village';

export class HUD {
  miniMap: MiniMap;
  dialogBox: DialogBox;
  renderSuperstition = false;
  renderLives = false;
  renderMagic = false;
  villageName = '';
  villageNameTimer = 0;

  constructor(
    public map: GameMap,
    public player: Player,
    public actions: Actions,
    public gameData: GameData,
  ) {
    this.miniMap = new MiniMap(map);
    this.dialogBox = new DialogBox();

    on(GameEvent.ENABLE_SCRATCH, () => {
      this.renderLives = true;
    });

    on(GameEvent.NOT_ENOUGH_MAGIC, () => {
      this.renderMagic = true;
    });

    on(GameEvent.ENTER_VILLAGE, (village: Village) => {
      this.villageName = village.name;
      this.villageNameTimer = 3000;
    });

    on(GameEvent.SCARED, () => {
      this.renderSuperstition = true;
    });
  }

  update(timeElapsed: number) {
    this.miniMap.update(timeElapsed);
    this.villageNameTimer -= timeElapsed;
  }

  draw() {
    this.renderLives && this.drawLives();
    this.renderMagic && this.drawMagic();
    this.drawGoals();
    this.renderSuperstition && this.drawSuperstition();
    this.drawActions();
    this.drawInfoBox();
    this.renderLives && this.miniMap.draw(this.player);
    this.dialogBox.draw();
  }

  drawActions() {
    const actions = this.actions.actions;
    if (!actions || !actions[0].enabled) {
      return;
    }

    const boxWidth = 120;
    const boxHeight = 120;
    const spacing = 10;
    const totalWidth = actions.length * boxWidth + (actions.length - 1) * spacing;
    const startX = Math.round((drawEngine.ctx3.canvas.width - totalWidth) / 2);
    const y = drawEngine.ctx3.canvas.height - boxHeight - 10;

    actions.forEach(({ type, color, symbol }, index) => {
      const x = startX + index * (boxWidth + spacing);

      // Draw background box
      drawEngine.ctx3.fillStyle = colors.purple0;
      drawEngine.ctx3.fillRect(x, y, boxWidth, boxHeight);

      // Draw symbol (large font)
      drawEngine.drawText(
        symbol,
        x + boxWidth / 2,
        y + 30,
        color,
        1, // center
        1, // middle
        7,
        1,
        drawEngine.ctx3
      );

      // Draw action name
      drawEngine.drawText(
        type,
        x + boxWidth / 2,
        y + 95,
        colors.black,
        1, // center
        1, // middle
        3,
        1,
        drawEngine.ctx3
      );
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
    drawEngine.drawText(text, x + size, y + size, colors.purple4, 0, 0, size, 1, drawEngine.ctx3);
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
    drawEngine.drawText(text, x + size, y + size, colors.blue2, 0, 0, size, 1, drawEngine.ctx3);

    text = MAGIC.repeat(emptyMagic);
    x -= text.length * charWidth;
    drawEngine.drawText(text, x + size, y + size, colors.blue3, 0, 0, size, 1, drawEngine.ctx3);

    text = MAGIC.repeat(noMagic);
    x -= text.length * charWidth;
    drawEngine.drawText(text, x + size, y + size, colors.yellow2, 0, 0, size, 1, drawEngine.ctx3);
  }

  drawGoals() {
    const goals = this.gameData.goals;

    const baseX = 16;
    const y = 16 + 7 * 5 + 10; // lives y  + lives box height + margin
    const boxW = 510;
    const boxH = 5 * 7 + 30;
    const size = 3;
    const padding = 5;
    const aD = 200; // 100ms slide animation
    
    goals.filter(goal => goal.time > 0)
    .forEach((goal, i) => {
      const {label, time} = goal;
      const boxY = y + (boxH + padding) * i;
      
      // Calculate animation offset based on remaining time
      let offsetX = 0;
      const distanceX = boxW + baseX;
      if (time > NOTIFICATION_DURATION - aD) {
        // Sliding in from left (appearing)
        const progress = (NOTIFICATION_DURATION - time) / aD;
        const easedProgress = easeInOutSine(progress, 0, 1);
        offsetX = -distanceX * (1 - easedProgress);
      } else if (time < aD) {
        // Sliding out to left (disappearing)
        const progress = time / aD;
        const easedProgress = easeInOutSine(progress, 0, 1);
        offsetX = -distanceX * (1 - easedProgress);
      }
      
      const x = baseX + offsetX;
      
      drawEngine.ctx3.fillStyle = colors.purple4;
      drawEngine.ctx3.fillRect(x, boxY, boxW, boxH);
      drawEngine.drawText(
        'GOAL',
        x + size + padding,
        boxY + padding,
        colors.white,
        0, // left
        0, // top
        size + 1,
        1,
        drawEngine.ctx3
      );
      drawEngine.drawText(
        label,
        x + size + padding + 20,
        35 + boxY + padding,
        colors.purple0,
        0, // left
        0, // top
        size,
        1,
        drawEngine.ctx3
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

    drawEngine.drawText(text, c3.width / 2, y + boxH + size, colors.blue5, 1, 0, size, 1, drawEngine.ctx3);
  }

  drawInfoBox() {
    if(this.villageNameTimer > 0) {
      const t = this.villageNameTimer;
      const tNorm = Math.max(0, Math.min(1, Math.min(t / 150, (3000 - t) / 150)));
      const opacity = easeInOutSine(tNorm, 0, 1);
      drawEngine.ctx3.globalAlpha = opacity;
      this.drawInfo(`^^ ${this.villageName}`, 170);
      drawEngine.ctx3.globalAlpha = 1;
    }

    if (this.map.playerLookingAt) {
      const cell = this.map.getLookingAt();
      if (cell?.content?.name) {
        this.drawInfo(cell.content.name, c3.height - 170);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  drawInfo(text: string, yPos: number) {
    const boxWidth = 350;
    const boxHeight = 35;

    const x = c3.width / 2 - boxWidth / 2;
    const y = yPos - 6 * 3;
    
    drawEngine.ctx3.fillStyle = colors.purple4;
    drawEngine.ctx3.fillRect(
      x,
      y+3,
      boxWidth,
      boxHeight,
    );
    drawEngine.ctx3.fillRect(
      x - 15,
      y + 15,
      boxHeight,
      boxHeight,
    );
    drawEngine.ctx3.fillRect(
      x + boxWidth - 15,
      y + 15,
      boxHeight,
      boxHeight,
    );
    drawEngine.ctx3.fillStyle = colors.yellow2;
    drawEngine.ctx3.fillRect(
      x,
      y,
      boxWidth,
      boxHeight,
    );

    drawEngine.drawText(
      text,
      c3.width / 2,
      yPos,
      colors.purple4,
      1, // center
      1, // middle
      3,
      1,
      drawEngine.ctx3
    );
  }
}
