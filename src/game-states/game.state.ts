import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/game/player';
import { Tree } from '@/game/tree';
import { CELL_HEIGHT, CELL_WIDTH, GameMap } from '@/game/game-map';

class GameState implements State {
  map!: GameMap;
  cat!: Player;

  constructor() {
    
  }

  onEnter() {
    this.map = new GameMap(160, 160);
    const centerX = Math.floor(160 / 2) * CELL_WIDTH;
    const centerY = Math.floor(160 / 2) * CELL_HEIGHT;
    this.cat = new Player(centerX, centerY, this.map);
    this.map.set(80, 80, null);
  }

  onUpdate(timeElapsed: number) {
    drawEngine.setCamera(this.cat.x, this.cat.y, 5);
    this.cat.update(timeElapsed);
    this.map.draw(this.cat.x, this.cat.y);
    this.cat.draw(timeElapsed);
    drawEngine.resetCamera();
  }
}

export const gameState = new GameState();
