import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/game/player';
import { GameMap } from '@/game/game-map';
import { MiniMap } from '@/game/mini-map';
import { HUD } from '@/game/hud';

class GameState implements State {
  map!: GameMap;
  cat!: Player;
  miniMap!: MiniMap;
  hud!: HUD;

  constructor() {
    
  }

  onEnter() {
    this.hud = new HUD();
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
    this.map.set(this.cat.col, this.cat.row, null);
    this.cat.update(timeElapsed);
    this.map.set(this.cat.col, this.cat.row, this.cat);
    this.map.draw(this.cat.x, this.cat.y);
    drawEngine.resetCamera();
    
    this.miniMap.update(timeElapsed, this.cat);
    this.hud.draw();
  }
}

export const gameState = new GameState();
