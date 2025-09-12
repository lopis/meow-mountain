import { emit, on } from '@/core/event';
import { MAX_LIVES, NOTIFICATION_DURATION } from './constants';
import { SceneProps } from './game-story';
import { GameEvent } from './event-manifest';
import { addTimeEvent } from '@/core/timer';
import { heal } from '@/core/audio';

interface Goal {
  label: string,
  time: number,
}

export class GameData {
  cutscene = false;
  lives = MAX_LIVES;
  maxMagic = 0;
  magic = 0;
  superstition = 0;
  goals: Goal[] = [];
  hasClearedIntro = false;
  win = false;

  constructor() {
    on(GameEvent.SCARED, () => {
      this.superstition = Math.min(1, this.superstition + 0.01);
    });

    on(GameEvent.CUTSCENE_START, () => {
      this.cutscene = true;
    });

    on(GameEvent.CUTSCENE_END, (scene: SceneProps) => {
      this.cutscene = false;
      if (scene.goals) {
        scene.goals.forEach(goal => {
          this.goals.push({
            label: goal,
            time: NOTIFICATION_DURATION,
          });
        });
      }
    });

    on(GameEvent.ATTACK_PLAYER, (level: number) => {
      this.lives -= (level + 1) / 3;
      this.lives = Math.round(this.lives * 3) / 3;
      this.lives = Math.round(this.lives * 10) / 10;
      if (this.lives <= 0) {
        this.lives = 0;
        emit(GameEvent.GAME_OVER);
      }
    });

    on(GameEvent.STATUE_RESTORED, () => {
      this.maxMagic++;
      this.magic = this.maxMagic;
      this.heal();
    });

    on(GameEvent.SLEEP, () => {
      this.heal();
    });
  }

  heal() {
    let i = 0;
    for (let lives = Math.floor(this.lives) + 1; lives <= MAX_LIVES; lives++) {
      addTimeEvent(() => {
        this.lives = lives;
        heal();
      }, 500 + 800 * (i++));
    }
  }

  update(timeElapsed: number) {
    this.goals.forEach(goal => goal.time -= timeElapsed);
  }

  getLevel() {
    return this.superstition * 4 + this.maxMagic;
  }
}
