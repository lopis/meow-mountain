import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/game/player';
import { Tree } from '@/game/tree';
import { GameMap } from '@/game/game-map';

class GameState implements State {
  map!: GameMap;
  cat!: Player;

  constructor() {
    
  }

  onEnter() {
    this.cat = new Player(0, 0);
    this.map = new GameMap(160, 160);
    this.map.set(0, 0, this.cat);
  }

  onUpdate(timeElapsed: number) {
    drawEngine.setCamera(this.cat.x, this.cat.y, 4);
    this.cat.update(timeElapsed);
    this.map.draw(this.cat.x, this.cat.y);
    drawEngine.resetCamera();
  }
}

export const gameState = new GameState();
