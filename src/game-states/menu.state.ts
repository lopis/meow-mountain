import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { colors } from '@/core/util/color';

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

class MenuState implements State {
  private isStartSelected = true;

  onUpdate() {
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
}

export const menuState = new MenuState();
