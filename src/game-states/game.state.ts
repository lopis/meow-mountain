import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/game/player';
import { Tree } from '@/game/tree';
import { CELL_HEIGHT, CELL_WIDTH, GameMap } from '@/game/game-map';
import { MiniMap } from '@/game/mini-map';
import { Icon } from '@/game/icon';
import { icons } from '@/game/game-assets';

class GameState implements State {
  map!: GameMap;
  cat!: Player;
  miniMap!: MiniMap;

  constructor() {
    
  }

  onEnter() {
    this.map = new GameMap(160, 160);
    const centerX = 690;
    const centerY = 940;
    this.cat = new Player(centerX, centerY, this.map);
    this.miniMap = new MiniMap(this.map);
    drawEngine.setCamera(this.cat.x, this.cat.y - 20, 7, true);
  }

  onUpdate(timeElapsed: number) {
    drawEngine.setCamera(this.cat.x, this.cat.y, 7);
    drawEngine.updateCamera();
    this.map.set(this.cat.gx, this.cat.gy, null);
    this.cat.update(timeElapsed);
    this.map.set(this.cat.gx, this.cat.gy, this.cat);
    this.map.draw(this.cat.x, this.cat.y);
    drawEngine.resetCamera();
    
    this.miniMap.update(timeElapsed, this.cat);
  }
}

export const gameState = new GameState();
