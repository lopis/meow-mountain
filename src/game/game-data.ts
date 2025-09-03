import { emit, on } from '@/core/event';
import { MAX_LIVES, NOTIFICATION_DURATION } from './constants';
import { SceneProps } from './game-story';
import { GameEvent } from './event-manifest';

interface Goal {
  label: string,
  time: number,
}

export class GameData {
  cutscene = false;
  lives = MAX_LIVES;
  maxMagic = 0;
  magic = 0;
  level = 1;
  superstition = 0;
  superstitionCooldown = 0;
  goals: Goal[] = [];

  constructor() {
    on(GameEvent.SCARED, () => {
      this.superstition = Math.min(1, this.superstition + 0.005);
      this.superstitionCooldown = 5000;
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
    });
  }

  update(timeElapsed: number) {
    this.superstitionCooldown -= timeElapsed;
    if (this.superstition > 0 && this.superstitionCooldown <= 0) {
      this.superstition -= (1 / timeElapsed) * 0.001;
    }

    this.goals.forEach(goal => goal.time -= timeElapsed);
  }
}
