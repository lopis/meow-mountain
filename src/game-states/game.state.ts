import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/game/player';
import { GameMap } from '@/game/game-map';
import { MiniMap } from '@/game/mini-map';
import { HUD } from '@/game/hud';

class GameState implements State {
  map!: GameMap;
  cat!: Player;
  hud!: HUD;

  constructor() {

  }

  onEnter() {
    this.map = new GameMap(160, 160);
    this.cat = new Player(65, 85, this.map);
    this.hud = new HUD(this.map, this.cat);
    // this.cat = new Player(130, 29, this.map);
    this.map.set(this.cat.col, this.cat.row, this.cat);
    drawEngine.setCamera(this.cat.x, this.cat.y - 20, 7, true);
  }

  onUpdate(timeElapsed: number) {
    drawEngine.setCamera(this.cat.x, this.cat.y, 7);
    drawEngine.updateCamera();
    this.map.update(timeElapsed);
    this.map.draw(this.cat.x, this.cat.y);
    drawEngine.resetCamera();
    this.hud.update();
    this.hud.draw();
  }
}

export const gameState = new GameState();
