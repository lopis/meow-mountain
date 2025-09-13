import { CatStates, GameAssets } from '@/game/game-assets';
import { GameObject } from '../../core/game-object';
import { controls } from '../../core/controls';
import { GameMap } from '../game-map';
import { CELL_HEIGHT, CELL_WIDTH, statues } from '../constants';
import { emit, on } from '@/core/event';
import { addTimeEvent } from '@/core/timer';
import { Spirit } from './spirit';
import { GameData } from '../game-data';
import { PentagramAnimation } from './pentagram-attack';
import { forEachSurroundingCell } from '../grid-utils';
import { drawEngine } from '@/core/draw-engine';
import { GameEvent } from '../event-manifest';
import { attack, attack5, step } from '@/core/audio';

const ANIMATION_SLOW = 600;
const ANIMATION_NORMAL = 150;
const ANIMATION_FAST = 75;

const STEP_SOUND_TIME = 200;

export class Player extends GameObject<CatStates> {
  type = 'cat';
  sleeping = true;
  attacking = false;
  scared = false;
  inVillage = false;
  pentagramAttack: PentagramAnimation | null = null;
  stepSoundTimer = 0;

  constructor(col: number, row: number, public map: GameMap, public gameData: GameData) {
    super(
      GameAssets.cat,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'cat',
      CatStates.sleep,
      80,
    );

    this.aD = ANIMATION_SLOW;
    
    // Initialize looking direction to the right
    this.map.playerLookingAt = { col: col + 1, row };

    on(GameEvent.TELEPORT, () => {
      this.setPos(statues.heart.x, statues.heart.y + 1);
    });

    on(GameEvent.WAKE_UP, () => {
      this.sleeping = false;
      this.aD = ANIMATION_NORMAL;
    });

    on(GameEvent.ATTACK_PLAYER, () => {
      this.scared = true;
      this.aD = ANIMATION_FAST;
      addTimeEvent(() => {
        this.aD = ANIMATION_NORMAL;
        this.scared = false;
      }, 600);
    });

    on(GameEvent.GAME_OVER, () => {
      this.animation = CatStates.die;
      this.animationTime = 0;
      this.aD = ANIMATION_SLOW;
      this.animationLoop = false;
    });
  }

  update(timeElapsed: number) {
    super.update(timeElapsed);

    if (this.animation === CatStates.die) return;

    if (this.animation == CatStates.run) {
      this.stepSoundTimer -= timeElapsed;
      if (this.stepSoundTimer <= 0) {
        step();
        this.stepSoundTimer = STEP_SOUND_TIME;
      }
    } else {
      this.stepSoundTimer = 0;
    }

    const cellVillage = this.map.grid[this.row][this.col].village;
    if (!this.inVillage && cellVillage) {
      this.inVillage = true;
      emit(GameEvent.ENTER_VILLAGE, cellVillage);
    } else if (this.inVillage && !cellVillage) {
      this.inVillage = false;
    }

    // DEBUG
    // coords.innerText = `${this.col},${this.row}`;

    if (this.gameData.cutscene) {
      return;
    }
    
    if(this.scared && !this.isSurrounded()) {
      this.animation = CatStates.scared;
    } else if (this.sleeping) {
      this.animation = CatStates.sleep;
    } else if (this.attacking) {
      this.animation = CatStates.scratch;
    } else {
      super.updatePositionSmoothly(timeElapsed);


      if (!this.moving.y && controls.inputDirection.y) {
        const newRow = this.row + controls.inputDirection.y;
        
        if (!this.map.grid[newRow][this.col].content) {
          this.animation = CatStates.run;
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
        
        if (!this.map.grid[this.row][newCol].content) {
          this.animation = CatStates.run;
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
        this.animation = CatStates.idle;
      }

      // When not attacking, check if playerLookingAt is empty;
      // If playerLookingAt is empty, look into 4 directions;
      // If one of the directions is type spirit, set that direction as playerLookingAt;
      // Else if one of the directions is a statue or obelisk, set that direction as playerLookingAt.
      if (!this.attacking) {
        this.autoSelectTarget();
      }

      if (!this.attacking && controls.isAction1 && !controls.previousState.isAction1) {
        this.attacking = true;
        this.animationTime = 0;

        if (!this.pentagramAttack && this.isSurrounded()) {
          console.log('pentagram start');
          
          this.pentagramAttack = new PentagramAnimation(
            drawEngine.ctx1,
            this.x,
            this.y,
            () => {
              console.log('pentagram end');
              this.pentagramAttack = null;
              this.attackAllEnemiesAround();
              this.attacking = false;
              attack5();
            },
          );
        } else {
          // Check if there is an enemy right in front
          addTimeEvent(() => this.attackEnemyInFront(), 500);
          addTimeEvent(() => {
            this.attacking = false;
          }, this.aD * 5);
        }
      }
    }
    this.pentagramAttack?.update(timeElapsed);
  }

  // Deals 5 damage to all spirits
  // in the 9 cells around the cat.
  attackAllEnemiesAround() {
    forEachSurroundingCell(this.col, this.row, (col, row) => {
      const cell = this.map.grid[row][col];
      if (cell.content?.type === 'spirit') {
        const spirit = cell.content as Spirit;
        spirit.takeDamage(5);
      }
    });
  }

  // Returns true if there are 3 or more spirits
  // in the 9 cells around the cat.
  isSurrounded() {
    let spiritCount = 0;
    forEachSurroundingCell(this.col, this.row, (col, row) => {
      const cell = this.map.grid[row][col];
      if (cell.content?.type === 'spirit') {
        spiritCount++;
      }
    });
    return spiritCount >= 3;
  }

  draw() {
    super.draw();
    this.pentagramAttack?.draw();
  }

  private autoSelectTarget() {
    // Check if current looking position is empty
    const currentCell = this.map.getLookingAt();
    if (currentCell?.content) {
      return; // Already looking at something
    }

    // Check 4 directions around player
    const directions = [
      { col: this.col + 1, row: this.row }, // right
      { col: this.col - 1, row: this.row }, // left
      { col: this.col, row: this.row + 1 }, // down
      { col: this.col, row: this.row - 1 }, // up
    ];

    let spiritTarget = null;
    let statueTarget = null;

    for (const dir of directions) {
      const cell = this.map.grid[dir.row][dir.col];
      if (!cell.content) continue;

      const contentType = cell.content.type;
      
      // Prioritize spirits first
      if (contentType === 'spirit') {
        spiritTarget = dir;
        break; // Spirit has highest priority, stop searching
      }
      
      // Store statue/obelisk as backup
      if ((contentType === 'statue' || contentType === 'obelisk') && !statueTarget) {
        statueTarget = dir;
      }
    }

    // Set target based on priority: spirit > statue/obelisk
    if (spiritTarget) {
      this.map.playerLookingAt = spiritTarget;
    } else if (statueTarget) {
      this.map.playerLookingAt = statueTarget;
    }
  }

  private attackEnemyInFront() {
    // Check if there's a spirit at the target position
    const cell = this.map.getLookingAt();
    if (cell.content && cell.content.type === 'spirit') {
      const spirit = cell.content as Spirit;
      spirit.takeDamage(1);
      attack();
    } else if (cell.content && cell.content.type === 'field') {
      cell.content = null;
      step(3);
    }
  }
}
