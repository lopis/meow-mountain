import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/core/player';

class GameState implements State {
  cat: Player;

  constructor() {
    this.cat = new Player(100, 100);
  }

  onEnter() {
    console.log(drawEngine);
    
  }

  onUpdate(timeElapsed: number) {
    drawEngine.setCamera(this.cat.x, this.cat.y, 4);
    this.cat.update(timeElapsed);
    this.cat.draw(timeElapsed);
    drawEngine.resetCamera();
  }
}

export const gameState = new GameState();
