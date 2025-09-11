import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/game/entities/player';
import { GameMap } from '@/game/game-map';
import { HUD } from '@/game/hud';
import { Actions } from '@/game/actions';
import { GameData } from '@/game/game-data';
import { GameStory } from '@/game/game-story';
import { addTimeEvent, updateTimeEvents } from '@/core/timer';
import { Obelisk } from '@/game/entities/obelisk';
import musicPlayer from '@/core/music-player';
import { on } from '@/core/event';
import { GameEvent } from '@/game/event-manifest';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from './menu.state';

export class GameState implements State {
  map!: GameMap;
  cat!: Player;
  hud!: HUD;
  actions!: Actions;
  gameData!: GameData;
  story!: GameStory;
  playMusic = true;

  onLeave() {
    musicPlayer.stop();
  }

  onEnter() {
    if (this.playMusic) {
      musicPlayer.start();
    }
    
    on(GameEvent.ENABLE_SCRATCH, () => {
      musicPlayer.startMelody();
    });
    on(GameEvent.PAUSE, () => {
      musicPlayer.pause();
    });
    on(GameEvent.UNPAUSE, () => {
      musicPlayer.unpause();
    });

    on(GameEvent.GAME_OVER, () => {
      addTimeEvent(() => gameStateMachine.setState(menuState), 2000);
    });

    on(GameEvent.FADE_OUT, () => {
      gameStateMachine.setState(menuState);
    });

    this.gameData = new GameData();
    this.map = new GameMap(160, 160, this.gameData);
    this.cat = new Player(60, 85, this.map, this.gameData);
    this.actions = new Actions(this.map, this.cat);
    this.hud = new HUD(this.map, this.cat, this.actions, this.gameData);
    this.story = new GameStory();
    
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
      this.gameData.update(timeElapsed);
    } else if (this.gameData.cutscene) {
      this.cat.update(timeElapsed);
    }
    this.story.update(timeElapsed);
    updateTimeEvents(timeElapsed);

    if (this.gameData.lives > 0 && !this.gameData.win) {
      this.map.draw(this.cat.x, this.cat.y);
      this.hud.draw();
    } else {
      if (this.gameData.lives > 0) {
        this.hud.draw();
      }
      this.cat.update(timeElapsed);
      this.cat.draw();
    }
    drawEngine.resetCamera();
  }
}
