import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/game/entities/player';
import { GameMap } from '@/game/game-map';
import { HUD } from '@/game/hud';
import { Actions } from '@/game/actions';
import { GameData } from '@/game/game-data';
import { ParticleEngine } from '@/core/particle';
import { GameStory } from '@/game/game-story';
import { updateTimeEvents } from '@/core/timer';
import { Obelisk } from '@/game/entities/obelisk';

class GameState implements State {
  map!: GameMap;
  cat!: Player;
  hud!: HUD;
  actions!: Actions;
  gameData!: GameData;
  particles!: ParticleEngine;
  story!: GameStory;

  onEnter() {
    this.particles = new ParticleEngine(drawEngine.ctx2);
    this.gameData = new GameData();
    this.map = new GameMap(160, 160);
    this.cat = new Player(60, 85, this.map);
    this.actions = new Actions(this.map, this.cat);
    this.hud = new HUD(this.map, this.cat, this.actions, this.gameData);
    this.story = new GameStory();
    // this.cat = new Player(statues.ear.x, statues.ear.y + 3, this.map);
    
    this.map.set(this.cat.col, this.cat.row, this.cat);
    new Obelisk(this.map);
    drawEngine.setCamera(this.cat.x, this.cat.y, 20, true);
    drawEngine.cameraLerpSpeed = 0.01;
  }

  onUpdate(timeElapsed: number) {
    const zoom = 7 + (7 - this.gameData.lives);
    drawEngine.setCamera(this.cat.x, this.cat.y, zoom);
    drawEngine.updateCamera();

    if (!(this.gameData.cutscene) && this.gameData.lives > 0) {
      this.actions.update();
      this.map.update(timeElapsed);
      this.hud.update(timeElapsed);
      this.particles.update(timeElapsed);
      this.gameData.update(timeElapsed);
    } else if (this.gameData.cutscene) {
      this.cat.update(timeElapsed);
    }
    this.story.update(timeElapsed);
    updateTimeEvents(timeElapsed);

    if (this.gameData.lives == 0) {
      this.cat.draw();
    } else {
      this.map.draw(this.cat.x, this.cat.y);
      this.hud.draw();
    }
    drawEngine.resetCamera();
  }
}

export const gameState = new GameState();
