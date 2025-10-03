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
  sitting = false;
  attacking = false;
  scared = false;
  inVillage = false;
  pentagramAttack: PentagramAnimation | null = null;
  stepSoundTimer = 0;
  sittingTimer = 0;

  constructor(col: number, row: number, public map: GameMap, public gameData: GameData) {
    super(
      GameAssets.cat,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'cat',
      CatStates.sleep,
      80,
    );

    // Initialize looking direction to the right
    this.map.playerLookingAt = { col: col + 1, row };

    on(GameEvent.TELEPORT, () => {
      this.setPos(statues.heart.x, statues.heart.y + 1);
    });

    on(GameEvent.WAKE_UP, () => {
      this.sleeping = false;
      this.sitting = true;
    });

    on(GameEvent.ENABLE_SCRATCH, () => {
      this.sitting = false;
    });

    on(GameEvent.ATTACK_PLAYER, () => {
      this.scared = true;
      addTimeEvent(() => {
        this.scared = false;
      }, 600);
    });

    on(GameEvent.GAME_OVER, () => {
      this.animation = CatStates.die;
      this.animationTime = 0;
      this.animationLoop = false;
    });
  }

  updateAnimation(timeElapsed: number) {
    super.update(timeElapsed);

    switch(this.animation) {
      case CatStates.sleep:
      case CatStates.sit:
        this.aD = ANIMATION_SLOW;
        break;
      case CatStates.scared:
        this.aD = ANIMATION_FAST;
        break;
      default:
        this.aD = ANIMATION_NORMAL;
        break;
    }
  }

  update(timeElapsed: number) {
    if (this.animation === CatStates.die) return;

    if (this.animation === CatStates.run) {
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
    coords.innerText = `${this.col},${this.row}`;

    if (this.gameData.cutscene) {
      return;
    }
    
    if(this.scared && !this.isSurrounded()) {
      this.animation = CatStates.scared;
    } else if (this.sleeping) {
      this.animation = CatStates.sleep;
    } else if (this.sitting) {
      this.animation = CatStates.sit;
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
        this.sittingTimer += timeElapsed;
        if (this.sittingTimer > 2000) {
          this.animation = CatStates.sit;
        }
      } else {
        this.sittingTimer = 0;
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
      { col: this.col + 1, row: this.row, facing: 'right' },
      { col: this.col - 1, row: this.row, facing: 'left' },
      { col: this.col, row: this.row + 1, facing: 'down' },
      { col: this.col, row: this.row - 1, facing: 'up' },
    ];

    let spiritTarget = null;
    let statueTarget = null;
    let spiritFacing = null;
    let statueFacing = null;

    for (const dir of directions) {
      const cell = this.map.grid[dir.row][dir.col];
      if (!cell.content) continue;

      const contentType = cell.content.type;

      // Prioritize spirits first
      if (contentType === 'spirit') {
        spiritTarget = { col: dir.col, row: dir.row };
        spiritFacing = dir.facing;
        break; // Spirit has highest priority, stop searching
      }

      // Store statue/obelisk as backup
      if ((contentType === 'statue' || contentType === 'obelisk') && !statueTarget) {
        statueTarget = { col: dir.col, row: dir.row };
        statueFacing = dir.facing;
      }
    }

    // Set target and facing based on priority: spirit > statue/obelisk
    if (spiritTarget) {
      this.map.playerLookingAt = spiritTarget;
      if (spiritFacing === 'left') this.mirrored = true;
      else if (spiritFacing === 'right') this.mirrored = false;
      // Optionally handle up/down facing if needed
    } else if (statueTarget) {
      this.map.playerLookingAt = statueTarget;
      if (statueFacing === 'left') this.mirrored = true;
      else if (statueFacing === 'right') this.mirrored = false;
      // Optionally handle up/down facing if needed
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
