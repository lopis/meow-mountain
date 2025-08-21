import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/game/player';
import { Tree } from '@/game/tree';
import { CELL_HEIGHT, CELL_WIDTH, GameMap } from '@/game/game-map';
import { MiniMap } from '@/game/mini-map';

class GameState implements State {
  map!: GameMap;
  cat!: Player;
  miniMap!: MiniMap;

  constructor() {
    
  }

  onEnter() {
    this.map = new GameMap(160, 160, 42);
    const centerX = 690;
    const centerY = 940;
    this.cat = new Player(centerX, centerY, this.map);
    this.map.set(80, 80, null);
    this.miniMap = new MiniMap(this.map);
  }

  onUpdate(timeElapsed: number) {
    drawEngine.setCamera(this.cat.x, this.cat.y, 7);
    drawEngine.updateCamera();
    this.cat.update(timeElapsed);
    this.map.draw(this.cat.x, this.cat.y);
    this.cat.draw(timeElapsed);
    drawEngine.resetCamera();
    
    this.miniMap.update(timeElapsed, this.cat);
  }
}

export const gameState = new GameState();
