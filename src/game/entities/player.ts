import { CatStates, GameAssets } from '@/game/game-assets';
import { GameObject } from '../../core/game-object';
import { controls } from '../../core/controls';
import { GameMap } from '../game-map';
import { CELL_HEIGHT, CELL_WIDTH, statues } from '../constants';
import { on } from '@/core/event';
import { addTimeEvent } from '@/core/timer';
import { Spirit } from './spirit';
import { GameData } from '../game-data';

export class Player extends GameObject<CatStates> {
  type = 'cat';
  sleeping = true;
  attacking = false;
  confused = false;

  constructor(col: number, row: number, public map: GameMap, public gameData: GameData) {
    super(
      GameAssets.cat,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'cat',
      'sleep',
      80,
    );
    
    // Initialize looking direction to the right
    this.map.playerLookingAt = { col: col + 1, row };

    on('teleport', () => {
      this.setPos(statues.heart.x, statues.heart.y + 1);
    });

    on('wake-up', () => {
      this.sleeping = false;
    });

    on('attack-player', () => {
      this.confused = true;
      const animationDuration = this.animationDuration;
      this.animationDuration = animationDuration / 2;
      addTimeEvent(() => {
        this.animationDuration = animationDuration * 2;
        this.confused = false;
      }, 600);
    });

    on('game-over', () => {
      this.animation = 'die';
      this.animationLoop = false;
    });
  }

  update(timeElapsed: number) {
    super.update(timeElapsed);

    // DEBUG
    coords.innerText = `${this.col},${this.row}`;

    if (this.gameData.cutscene) {
      return;
    }
    
    if(this.confused) {
      this.animation = 'confused';
    } else if (this.sleeping) {
      this.animation = 'sleep';
    } else if (this.attacking) {
      this.animation = 'scratch';
    } else {
      super.updatePositionSmoothly(timeElapsed);

      if (!this.moving.y && controls.inputDirection.y) {
        const newRow = this.row + controls.inputDirection.y;
        
        if (newRow >= 0 && newRow < this.map.rowCount && !this.map.grid[newRow][this.col].content) {
          this.animation = 'run';
          this.moving.y = controls.inputDirection.y;
          this.targetPos.y += controls.inputDirection.y * CELL_HEIGHT;
          this.row = newRow;
          // Update looking direction after movement to point ahead
          this.map.playerLookingAt = { col: this.col, row: this.row + controls.inputDirection.y };
        } else {
          // Blocked movement - still update looking direction to attempted target
          this.map.playerLookingAt = { col: this.col, row: this.row + controls.inputDirection.y };
        }
      }

      if (!this.moving.x && controls.inputDirection.x) {
        this.mirrored = controls.isLeft;
        const newCol = this.col + controls.inputDirection.x;
        
        if (newCol >= 0 && newCol < this.map.colCount && !this.map.grid[this.row][newCol].content) {
          this.animation = 'run';
          this.moving.x = controls.inputDirection.x;
          this.targetPos.x += controls.inputDirection.x * CELL_WIDTH;
          this.col = newCol;
          // Update looking direction after movement to point ahead  
          this.map.playerLookingAt = { col: this.col + controls.inputDirection.x, row: this.row };
        } else {
          // Blocked movement - still update looking direction to attempted target
          this.map.playerLookingAt = { col: this.col + controls.inputDirection.x, row: this.row };
        }
      }

      if (!this.moving.x && !this.moving.y) {
        this.animation = 'idle';
        // Keep looking in the same direction as before (don't reset to horizontal)
        // playerLookingAt is already set from the last movement, so no need to update it
      }

      if (!this.attacking && controls.isAction1 && !controls.previousState.isAction1) {
        this.attacking = true;
        this.animationTime = 0;

        // Check if there is an enemy right in front
        addTimeEvent(() => this.attackEnemyInFront(), 500);

        addTimeEvent(() => {
          this.attacking = false;
        }, this.animationDuration * 5);
      }
    }
  }

  private attackEnemyInFront() {
    // Check if there's a spirit at the target position
    const cell = this.map.getLookingAt();
    if (cell.content && cell.content.type === 'spirit') {
      const spirit = cell.content as Spirit;
      spirit.takeDamage(1);
    }
  }
}
