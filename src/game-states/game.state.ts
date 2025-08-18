import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from '@/game-states/menu.state';

class GameState implements State {

  constructor() {
  }

  onEnter() {
    
  }

  onUpdate() {
    
  }
}

export const gameState = new GameState();
