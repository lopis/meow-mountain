import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { controls } from '@/core/controls';
import { Player } from '@/game/entities/player';
import { GameMap } from '@/game/game-map';
import { MiniMap } from '@/game/mini-map';
import { HUD } from '@/game/hud';
import { Actions } from '@/game/actions';
import { on } from 'events';
import { emit } from '@/core/event';
import { GameData } from '@/game/game-data';

class GameState implements State {
  map!: GameMap;
  cat!: Player;
  hud!: HUD;
  actions!: Actions;
  gameData!: GameData;

  constructor() {

  }

  onEnter() {
    this.gameData = new GameData();
    this.map = new GameMap(160, 160);
    // this.cat = new Player(65, 85, this.map);
    this.cat = new Player(130, 29, this.map);
    this.actions = new Actions(this.map, this.cat);
    this.hud = new HUD(this.map, this.cat, this.actions, this.gameData);
    this.map.set(this.cat.col, this.cat.row, this.cat);
    drawEngine.setCamera(this.cat.x, this.cat.y - 20, 7, true);
  }

  onUpdate(timeElapsed: number) {
    drawEngine.setCamera(this.cat.x, this.cat.y, 7);
    drawEngine.updateCamera();

    // Update actions based on player position
    this.actions.update();

    this.map.update(timeElapsed);
    this.hud.update(timeElapsed);
    this.gameData.update(timeElapsed);
    this.map.draw(this.cat.x, this.cat.y);
    this.hud.draw();
    drawEngine.resetCamera();
  }
}

export const gameState = new GameState();
