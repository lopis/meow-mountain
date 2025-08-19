import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Cat, GameAssets } from '@/game/game-assets';
import { GameObject } from '@/core/game-object';

class GameState implements State {
  cat: GameObject<Cat>;

  constructor() {
    this.cat = new GameObject(GameAssets.cat, 'idle', 100, 100);
  }

  onEnter() {
    console.log(drawEngine);
    
  }

  onUpdate(timeElapsed: number) {
    drawEngine.setCamera(this.cat.x, this.cat.y, 4);
    this.cat.draw(timeElapsed);
    drawEngine.resetCamera();
  }
}

export const gameState = new GameState();
