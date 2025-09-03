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
  isStartSelected = true;
  animationTimer = 0;

  onUpdate(timeElapsed: number) {
    this.animationTimer += timeElapsed;

    this.drawBackground();
    const xCenter = drawEngine.ctx2.canvas.width / 2;
    drawEngine.drawText(
      'Meow Mountain',
      xCenter,
      100,
      colors.blue0,
      1, // center
      0, // top
      15
    );
    drawEngine.drawText(
      `${this.isStartSelected ? '>' : ' '} Start Game`,
      xCenter,
      230,
      this.isStartSelected ? colors.white : colors.blue4,
      1, // center
      0, // top
      4
    );
    drawEngine.drawText(
      `${!this.isStartSelected ? '>' : ' '} Toggle Fullscreen`,
      xCenter,
      280,
      this.isStartSelected ? colors.blue4 : colors.white,
      1, // center
      0, // top
      4
    );
    this.updateControls();
  }

  drawBackground() {
    const bgColors = [
      colors.blue4,
      colors.blue3,
      colors.blue2,
      colors.blue1,
      colors.blue0,
    ];
    const sectionHeight = Math.ceil(c2.height / bgColors.length);
    const sections = 32;
    const sectionW = c2.width / sections;
    const offsetFreq = 4;
    const offsetAmplitude = 16;
    for (let index = 0; index < sections; index++) {
      const yOffset = Math.round(
        offsetAmplitude * Math.sin(1 - offsetFreq * 2 * Math.PI * index / sections)
        / 10
      ) * 10;
      bgColors.forEach((color, row) => {
        drawEngine.ctx1.fillStyle = color;
        drawEngine.ctx1.fillRect(
          sectionW * index,
          yOffset + sectionHeight * row - 20,
          Math.ceil(c2.width / sections),
          sectionHeight
        );
      });
    }

    const iconSize = 32;
    const iconInterval = 22;
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
        const offsetX = 5 * Math.sin(12 * Math.PI * (row / rows));
        drawEngine.drawBackgroundImage(
          0.2 + rng.next() > (row / (rows)) ? oak[0] : spruce[0],
          col * iconInterval + offsetX - iconSize/2,
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
