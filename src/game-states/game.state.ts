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
    // this.cat = new Player(65, 85, this.map);
    this.cat = new Player(130, 29, this.map);
    this.miniMap = new MiniMap(this.map);
    drawEngine.setCamera(this.cat.x, this.cat.y - 20, 7, true);
  }

  onUpdate(timeElapsed: number) {
    drawEngine.setCamera(this.cat.x, this.cat.y, 7);
    drawEngine.updateCamera();
    this.map.set(this.cat.col, this.cat.row, null);
    this.map.set(this.cat.col, this.cat.row, this.cat);
    this.map.update(timeElapsed);
    this.map.draw(this.cat.x, this.cat.y);
    drawEngine.resetCamera();

    this.miniMap.update(timeElapsed, this.cat);
    this.hud.draw();
  }
}

export const gameState = new GameState();
