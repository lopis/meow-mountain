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
import { drawEngine } from '@/core/draw-engine';
import { GameEvent } from '../event-manifest';

const ANIMATION_SLOW = 600;
const ANIMATION_NORMAL = 150;
const ANIMATION_FAST = 75;

export class Player extends GameObject<CatStates> {
  type = 'cat';
  sleeping = true;
  attacking = false;
  confused = false;
  inVillage = false;
  pentagramAttack: PentagramAnimation | null = null;

  constructor(col: number, row: number, public map: GameMap, public gameData: GameData) {
    super(
      GameAssets.cat,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'cat',
      'sleep',
      80,
    );

    this.animationDuration = ANIMATION_SLOW;
    
    // Initialize looking direction to the right
    this.map.playerLookingAt = { col: col + 1, row };

    on(GameEvent.TELEPORT, () => {
      this.setPos(statues.heart.x, statues.heart.y + 1);
    });

    on(GameEvent.WAKE_UP, () => {
      this.sleeping = false;
      this.animationDuration = ANIMATION_NORMAL;
    });

    on(GameEvent.ATTACK_PLAYER, () => {
      this.confused = true;
      this.animationDuration = ANIMATION_FAST;
      addTimeEvent(() => {
        this.animationDuration = ANIMATION_NORMAL;
        this.confused = false;
      }, 600);
    });

    on(GameEvent.GAME_OVER, () => {
      this.animation = 'die';
      this.animationLoop = false;
    });
  }

  update(timeElapsed: number) {
    super.update(timeElapsed);

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
    
    if(this.confused && !this.isSurrounded()) {
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
          this.pentagramAttack = new PentagramAnimation(
            drawEngine.ctx1,
            this.x,
            this.y,
            () => {
              this.pentagramAttack = null;
              this.attackAllEnemiesAround();
            },
          );
        }

        // Check if there is an enemy right in front
        addTimeEvent(() => this.attackEnemyInFront(), 500);

        addTimeEvent(() => {
          this.attacking = false;
        }, this.animationDuration * 5);
      }
      this.pentagramAttack?.update(timeElapsed);
    }
  }

  // Deals 5 damage to all spirits
  // in the 9 cells around the cat.
  attackAllEnemiesAround() {
    // Check 3x3 grid around player
    for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
      for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
        // Skip the center cell (player's position)
        if (deltaRow === 0 && deltaCol === 0) continue;
        
        const checkCol = this.col + deltaCol;
        const checkRow = this.row + deltaRow;
        const cell = this.map.grid[checkRow][checkCol];
        if (cell.content?.type === 'spirit') {
          const spirit = cell.content as Spirit;
          spirit.takeDamage(5);
        }
      }
    }
  }

  // Returns true if there are 3 or more spirits
  // in the 9 cells around the cat.
  isSurrounded() {
    let spiritCount = 0;
    
    // Check 3x3 grid around player
    for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
      for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
        // Skip the center cell (player's position)
        if (deltaRow === 0 && deltaCol === 0) continue;
        
        const checkCol = this.col + deltaCol;
        const checkRow = this.row + deltaRow;
        const cell = this.map.grid[checkRow][checkCol];
          if (cell.content?.type === 'spirit') {
            spiritCount++;
          }
      }
    }
    
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
    }
  }
}
