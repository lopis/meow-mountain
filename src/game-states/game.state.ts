import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { Player } from '@/game/entities/player';
import { GameMap } from '@/game/game-map';
import { HUD } from '@/game/hud';
import { Actions } from '@/game/actions';
import { GameData } from '@/game/game-data';
import { GameStory } from '@/game/game-story';
import { addTimeEvent, updateTimeEvents } from '@/core/timer';
import musicPlayer from '@/core/music-player';
import { clearEvents, on } from '@/core/event';
import { GameEvent } from '@/game/event-manifest';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from './menu.state';
import { MAX_LIVES } from '@/game/constants';
import { GameAssets } from '@/game/game-assets';
import { highRepair } from '@/core/audio';

export class GameState implements State {
  map!: GameMap;
  cat!: Player;
  hud!: HUD;
  actions!: Actions;
  gameData!: GameData;
  story!: GameStory;
  playMusic = true;
  zoomOffset = 0;
  cameraFollowsCat = true;
  cameraPos: {x: number, y:number} = {x:0, y:0};

  onLeave() {
    musicPlayer.stop();
    drawEngine.ctx4.clearRect(0, 0, c4.width, c4.height);
    clearEvents();
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
      addTimeEvent(() => gameStateMachine.setState(menuState), 3000);
    });

    on(GameEvent.FADE_OUT, () => {
      addTimeEvent(() => gameStateMachine.setState(menuState), 3000);
    });

    on(GameEvent.END_SEQUECE_START, () => {
      // Final statue camera pan
      const interval = 3000;
      const delay = 1000;
      musicPlayer.pause();

      // Turn each statue golden and exorcise all spirits
      this.map.statues.forEach((statue, i) => {
        addTimeEvent(() => {
          this.cameraFollowsCat = false;
          this.cameraPos = { x: statue.x, y: statue.y};
          drawEngine.setCamera(this.cameraPos.x, this.cameraPos.y, 5, true);
          addTimeEvent(() => {
            statue.img = GameAssets.statueGold;
            statue.maxSpirits = 0;
            statue.spirits.forEach(spirit => spirit.takeDamage(spirit.hp));
            highRepair(i);
          }, interval * 0.5);
        }, delay + interval * i);
      });

      // Turn the obelisk golden
      addTimeEvent(() => {
        this.cameraFollowsCat = false;
        const obelisk = this.map.obelisk;
        this.cameraPos = { x: obelisk.x, y: obelisk.y};
        drawEngine.setCamera(this.cameraPos.x, this.cameraPos.y, 5, true);
        addTimeEvent(() => {
          obelisk.img = GameAssets.obeliskGold;
          let repeat = 0;
          addTimeEvent(() => {
            highRepair(this.map.statues.length + (repeat++));
          }, 250, 4);
        }, interval * 1.5);
        addTimeEvent(() => {
          obelisk.startAnimation();
        }, interval * 2.0);
        addTimeEvent(() => {
          musicPlayer.start();
        }, interval * 2.0 + 500);
      }, delay + interval * this.map.statues.length);
    });

    // DEBUG: force statue final camera pan
    // addTimeEvent(() => {
    //   emit(GameEvent.END_SEQUECE_START);
    // }, 5000);

    this.gameData = new GameData();
    this.map = new GameMap(160, 160, this.gameData);
    this.cat = new Player(60, 85, this.map, this.gameData);
    // this.cat = new Player(94, 133, this.map, this.gameData);
    this.actions = new Actions(this.map, this.cat);
    this.hud = new HUD(this.map, this.cat, this.actions, this.gameData);
    this.story = new GameStory();
    
    this.map.set(this.cat.col, this.cat.row, this.cat);
    drawEngine.setCamera(this.cat.x, this.cat.y, 20, true);
    drawEngine.cameraLerpSpeed = 0.01;
  }

  onUpdate(timeElapsed: number) {
    const zoom = 5 + this.zoomOffset + (MAX_LIVES - this.gameData.lives) / MAX_LIVES;
    
    if (this.cameraFollowsCat) {
      drawEngine.setCamera(this.cat.x, this.cat.y, zoom);
      this.cameraPos = { x: this.cat.x, y: this.cat.y };
    } else {
      drawEngine.cameraLerpSpeed = 0.01;
      drawEngine.setCamera(this.cameraPos.x, this.cameraPos.y, 7);
    }
    drawEngine.updateCamera();

    if (this.gameData.lives > 0) {
      if (!this.gameData.cutscene) {
        this.actions.update();
      }
      this.map.update(timeElapsed, this.gameData.cutscene);
      this.hud.update(timeElapsed);
      this.gameData.update(timeElapsed);
    }
    this.story.update(timeElapsed);
    updateTimeEvents(timeElapsed);

    if (this.gameData.lives > 0 && !this.gameData.win) {
      this.map.draw(this.cameraPos.x, this.cameraPos.y);
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
