import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { colors } from '@/core/util/color';
import { GameAssets } from '@/game/game-assets';
import { SeededRandom } from '@/core/util/rng';

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const rng = new SeededRandom(0);

class MenuState implements State {
  private isStartSelected = true;

  onUpdate() {
    this.drawBackground();
    const xCenter = drawEngine.ctx2.canvas.width / 2;
    drawEngine.drawText({
      text: 'Whiskers Valley',
      x: xCenter,
      y: 100,
      color: colors.blue5,
      size: 6,
      textAlign: 'center',
    });
    drawEngine.drawText({
      text: `${this.isStartSelected ? '>' : ' '} Start Game`,
      x: xCenter,
      y: 200,
      color: this.isStartSelected ? colors.white : colors.blue4,
      size: 4,
      textAlign: 'center',
    });
    drawEngine.drawText({
      text: `${!this.isStartSelected ? '>' : ' '} Toggle Fullscreen`,
      x: xCenter,
      y: 250,
      color: this.isStartSelected ? colors.blue4 : colors.white,
      size: 4,
      textAlign: 'center',
    });
    this.updateControls();
  }

  drawBackground() {
    const bgColors = [
      colors.blue0,
      colors.blue1,
      colors.blue2,
      colors.blue3,
      colors.blue4,
    ];
    const sectionHeight = Math.ceil(c2.height / bgColors.length);
    bgColors.forEach((color, index) => {
      drawEngine.ctx1.fillStyle = color;
      drawEngine.ctx1.fillRect(0, sectionHeight * index, c2.width, sectionHeight);
    });

    const iconInterval = 11;
    const iconSize = 16;
    const cols = c2.width / iconInterval;
    const rows = (c2.height / 2) / iconInterval; // fill half the screen
    const oak: HTMLImageElement[] = GameAssets.assets.animations['oak'];
    const spruce: HTMLImageElement[] = GameAssets.assets.animations['spruce'];

    if (!oak) {
      return;
    }

    for (let col = 0; col <= cols + iconSize; col++) {
      const mountainHeight = rows * (1.2 - Math.cos((col / cols) * 2 * Math.PI));
      for(let row = mountainHeight; row > 0; row--) {
        const offsetX = 5 * Math.sin(12 * Math.PI * row / rows);
        drawEngine.drawBackgroundImage(
          0.2 + rng.next() > (row / (rows)) ? oak[0] : spruce[0],
          col * iconInterval + offsetX - iconSize,
          c2.height - (row * iconInterval + rng.next() * 0.7) / 2,
          false,
          iconSize,
          iconSize,
        );
      }
    }

    rng.rngSeed = 0;
  }

  updateControls() {
    if ((controls.isUp && !controls.previousState.isUp)
      || (controls.isDown && !controls.previousState.isDown)) {
      this.isStartSelected = !this.isStartSelected;
    }

    if (controls.isConfirm && !controls.previousState.isConfirm) {
      if (this.isStartSelected) {
        gameStateMachine.setState(gameState);
      } else {
        toggleFullscreen();
      }
    }
  }
};

export const menuState = new MenuState();
