import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from '@/game-states/menu.state';
import { Cat, GameAssets } from '@/game/game-assets';
import { GameObject } from '@/core/game-object';

class GameState implements State {
  cat: GameObject<Cat>;

  constructor() {
    this.cat = new GameObject(GameAssets.cat, 'idle', 100, 100);
  }

  onEnter() {
    this.cat.draw(0);
  }

  onUpdate(timeElapsed: number) {
  }
}

export const gameState = new GameState();
