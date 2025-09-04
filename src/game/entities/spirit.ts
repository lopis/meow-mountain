import { emojiToPixelArt } from '@/core/emoji';
import { Icon } from './icon';
import { drawEngine } from '@/core/draw-engine';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';
import { GameMap } from '../game-map';
import { updatePositionSmoothly, SmoothMovementState, setTargetPosition } from '@/utils/smooth-movement';
import { Coords, findShortestPath } from '../path-findind';
import { addTimeEvent } from '@/core/timer';
import { emit } from '@/core/event';
import { drawHpBar } from './hp-bar';
import { GameEvent } from '../event-manifest';

export type SpiritType = '☁️' | '👻' | '👹' | '🧿' | '🦀' | '🌵' | '🥨' | '🧚🏻‍♀️' | '💀';

interface SpiritSpecies {
  type: SpiritType,
  icon: HTMLImageElement,
  level: number,
}

export const spirits = ([
  '☁️', '🥨', '🌵', '🧚🏻‍♀️', '🦀', '👻', '👹', '🧿', '💀'
] as const).reduce<Record<SpiritType, SpiritSpecies>>((acc, type, index) => {
  acc[type] = { icon: emojiToPixelArt(type), type, level: Math.ceil((index) / 2) };
  return acc;
}, {} as Record<SpiritType, SpiritSpecies>);

export class Spirit extends Icon implements SmoothMovementState {
  static readonly State = {
    IDLE: 0,
    MOVING: 1,
    WINDING: 2,
    ATTACKING: 3,
    RESTING: 4
  } as const;

  animationDuration = 2000;
  animationTime = 0;
  opacity = 0;
  species: SpiritSpecies;
  map: GameMap;
  searchRadius = 9;
  moveTimer = 0;
  moveInterval = 600;
  targetPos: { x: number; y: number };
  moving = { x: 0, y: 0 };
  speed = 20;
  maxHp: number;
  hp: number;
  dead = false;
  recoil = false;
  
  // Simplified state system
  state: number = Spirit.State.IDLE;
  attackTimer = 0;
  attackDuration = 1000;
  attackTarget: Coords | null = null;
  attackOffsetX = 0;
  attackOffsetY = 0;

  constructor(
    col: number,
    row: number,
    type: SpiritType,
    map: GameMap,
  ) {
    super(spirits[type].icon, col, row, 'spirit');
    this.species = spirits[type];
    this.map = map;
    this.targetPos = { x: this.x, y: this.y };
    this.maxHp = Math.round(Math.pow(1.5, this.species.level + 1));
    this.hp = this.maxHp;
  }

  update(timeElapsed: number) {
    if (this.hp <= 0) return;

    this.animationTime += timeElapsed * Math.pow(this.species.level + 0.5, 2);
    if (this.opacity < 1) {
      this.opacity += timeElapsed / this.animationDuration;
    }
    if (this.animationTime >= this.animationDuration) {
      this.animationTime -= this.animationDuration;
    }

    switch (this.state) {
      case Spirit.State.IDLE:
      case Spirit.State.MOVING:
        updatePositionSmoothly(this, timeElapsed);
        const playerCoords = this.lookAroundForPlayer();
        if (playerCoords) {
          this.moveTimer += timeElapsed;
          if (this.moveTimer >= this.moveInterval) {
            this.moveTowardsPlayer(playerCoords);
            this.moveTimer = 0;
          }
        }
        break;

      case Spirit.State.WINDING:
      case Spirit.State.ATTACKING:
      case Spirit.State.RESTING:
        this.updateAttack(timeElapsed);
        break;
    }
  }

  private updateAttack(timeElapsed: number) {
    this.attackTimer += timeElapsed;
    const progress = this.attackTimer / this.attackDuration;
    
    if (!this.attackTarget) {
      this.state = Spirit.State.IDLE;
      return;
    }

    const dirX = this.attackTarget.col - this.col;
    const dirY = this.attackTarget.row - this.row;

    if (progress < 0.7) {
      // Winding up
      if (this.state !== Spirit.State.WINDING) this.state = Spirit.State.WINDING;
      const windProgress = progress / 0.7;
      this.attackOffsetX = -dirX * windProgress * 3;
      this.attackOffsetY = -dirY * windProgress * 3;
    } else if (progress < 0.73) {
      // Attacking
      if (this.state !== Spirit.State.ATTACKING) this.state = Spirit.State.ATTACKING;
      const attackProgress = (progress - 0.7) / 0.03;
      this.attackOffsetX = dirX * (-3 + CELL_WIDTH * attackProgress);
      this.attackOffsetY = dirY * (-3 + CELL_WIDTH * attackProgress);
    } else if (progress < 1.0) {
      // Resting (returning)
      if (this.state !== Spirit.State.RESTING) {
        this.state = Spirit.State.RESTING;
        
        // Only emit if player is still in the target cell
        const cell = this.map.grid[this.attackTarget.row][this.attackTarget.col];
        if (cell.content?.type === 'cat') {
          emit(GameEvent.ATTACK_PLAYER, this.species.level);
        }
      }
      const restProgress = (progress - 0.73) / 0.27;
      this.attackOffsetX = dirX * 3 * (1 - restProgress);
      this.attackOffsetY = dirY * 3 * (1 - restProgress);
    } else {
      // Attack complete
      this.state = Spirit.State.IDLE;
      this.attackTimer = 0;
      this.attackTarget = null;
      this.attackOffsetX = 0;
      this.attackOffsetY = 0;
    }
  }

  private lookAroundForPlayer(): Coords | null {
    // Search in a box around the spirit using the search radius
    for (let dx = -this.searchRadius; dx <= this.searchRadius; dx++) {
      for (let dy = -this.searchRadius; dy <= this.searchRadius; dy++) {
        const searchCol = this.col + dx;
        const searchRow = this.row + dy;

        const cell = this.map.grid[searchRow][searchCol];
        if (cell.content?.type === 'cat') {
          return { col: searchCol, row: searchRow };
        }
      }
    }
    
    return null;
  }

  private moveTowardsPlayer(playerCoords: Coords) {
    const path = findShortestPath(
      this.map.grid,
      { col: this.col, row: this.row },
      playerCoords,
    );
    if (path && path.length > 2) {
      this.state = Spirit.State.MOVING;
      const nextStep = path[1];
      setTargetPosition(this, nextStep.col, nextStep.row);
      this.col = nextStep.col;
      this.row = nextStep.row;
      this.targetPos.x = nextStep.col * CELL_WIDTH;
      this.targetPos.y = nextStep.row * CELL_HEIGHT;
    } else if (path?.length === 2) {
      // Start attack
      this.state = Spirit.State.WINDING;
      this.attackTarget = path[1];
      this.attackTimer = 0;
    }
  }

  draw() {
    const phase = Math.sin((this.animationTime / this.animationDuration) * 2 * Math.PI);
    drawEngine.ctx1.save();
    drawEngine.ctx1.globalAlpha = this.opacity;

    // Shadow
    const shadow = Math.round(2 + 1 * phase) / 10;
    drawEngine.ctx1.fillStyle = `rgba(0,0,0,${shadow})`;
    drawEngine.ctx1.fillRect(
      this.x + 3 + this.attackOffsetX,
      this.y + CELL_HEIGHT * 3 / 4 + this.attackOffsetY,
      this.icon.width - 6,
      CELL_HEIGHT / 4 + 1,
    );

    if (this.hp < this.maxHp) {
      drawHpBar(this.hp, this.maxHp, this.x, this.y);
    }

    // Icon
    drawEngine.ctx1.save();
    if (this.recoil) {
      drawEngine.ctx1.filter = 'sepia(1) saturate(2) hue-rotate(260deg) brightness(0.7)';
    }
    drawEngine.ctx1.translate(
      this.attackOffsetX,
      this.attackOffsetY + Math.round(
        (phase - 1) * 2
      )
    );
    super.draw();
    drawEngine.ctx1.restore();
    drawEngine.ctx1.restore();
  }

  takeDamage(damage: number = 1): boolean {
    this.hp -= damage;
    this.recoil = true;
    addTimeEvent(() => {
      this.recoil = false;
    }, 150);
    if (this.hp <= 0) {
      addTimeEvent(() => {
        this.dead = true;
      }, 2000);
    }
    return this.hp <= 0;
  }
}
