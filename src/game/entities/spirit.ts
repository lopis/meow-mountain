import { emojiToPixelArt } from "@/core/emoji";
import { Icon } from "./icon";
import { drawEngine } from "@/core/draw-engine";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";
import { GameMap } from "../game-map";
import { updatePositionSmoothly, SmoothMovementState, setTargetPosition } from "@/utils/smooth-movement";
import { Coords, findShortestPath } from "../path-findind";
import { addTimeEvent } from "@/core/timer";
import { colors } from "@/core/util/color";

export type SpiritType = '🎈' | '👻' | '👹' | '🧿' | '🦀' | '🌵' | '🥨' | '🧚🏻‍♀️' | '💀';

interface SpiritSpecies {
  type: SpiritType,
  icon: HTMLImageElement,
  level: number,
}

export const spirits = ([
  '🎈', '🥨', '🌵', '🧚🏻‍♀️', '🦀', '👻', '👹', '🧿', '💀'
] as const).reduce<Record<SpiritType, SpiritSpecies>>((acc, type, index) => {
  acc[type] = { icon: emojiToPixelArt(type), type, level: Math.ceil((index) / 2) };
  return acc;
}, {} as Record<SpiritType, SpiritSpecies>);

export class Spirit extends Icon implements SmoothMovementState {
  animationDuration = 2000;
  animationTime = 0;
  opacity = 0;
  species: SpiritSpecies;
  map: GameMap;
  searchRadius = 9; // Search in a 6x6 box around the spirit
  moveTimer = 0;
  moveInterval = 600; // Time between moves when chasing
  targetPos: { x: number; y: number };
  moving = { x: 0, y: 0 };
  speed = 20; // Pixels per second
  playerTarget: Coords | null = null;
  maxHp: number;
  hp: number;
  dead = false;
  attackingCoords: Coords | null = null;
  attackAnimationTime = 0;
  attackAnimationDuration = 1000;

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
    if (this.hp <=0) {
      return;
    }

    this.animationTime += timeElapsed * Math.pow(this.species.level, 2);
    if (this.opacity < 1) {
      this.opacity += timeElapsed / this.animationDuration;
    }
    if (this.animationTime >= this.animationDuration) {
      this.animationTime -= this.animationDuration;
    }

    if (this.attackingCoords) {
      this.updateAttackAnimation(timeElapsed);
      return;
    }

    // Update smooth movement
    updatePositionSmoothly(this, timeElapsed);

    // Search for the player in a box around the spirit
    const playerCoords = this.lookAroundForPlayer();

    // Handle movement when chasing
    if (playerCoords) {
      this.moveTimer += timeElapsed;
      if (this.moveTimer >= this.moveInterval) {
        this.moveTowardsPlayer(playerCoords);
        this.moveTimer = 0;
      }
    }
  }

  updateAttackAnimation(timeElapsed: number) {
    this.attackAnimationTime += timeElapsed;
    
    if (this.attackAnimationTime >= this.attackAnimationDuration) {
      // Attack animation complete, reset to normal behavior
      this.attackingCoords = null;
      this.attackAnimationTime = 0;
    }
  }

  private lookAroundForPlayer(): Coords | null {
    // Search in a box around the spirit using the search radius
    for (let dx = -this.searchRadius; dx <= this.searchRadius; dx++) {
      for (let dy = -this.searchRadius; dy <= this.searchRadius; dy++) {
        const searchCol = this.col + dx;
        const searchRow = this.row + dy;

        // Check bounds
        if (searchCol >= 0 && searchCol < this.map.colCount && 
            searchRow >= 0 && searchRow < this.map.rowCount) {
          
          const cell = this.map.grid[searchRow][searchCol];
          if (cell.content?.type === 'cat') {
            return { col: searchCol, row: searchRow };
          }
        }
      }
    }
    
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  private moveTowardsPlayer(playerCoords: Coords) {
    const path = findShortestPath(
      this.map.grid,
      { col: this.col, row: this.row },
      playerCoords,
    );
    if (path && path.length > 2) {
      const nextStep = path[1];
      setTargetPosition(this, nextStep.col, nextStep.row);
      this.col = nextStep.col;
      this.row = nextStep.row;
      this.targetPos.x = nextStep.col * CELL_WIDTH;
      this.targetPos.y = nextStep.row * CELL_HEIGHT;
    } else if (path?.length === 2) {
      const nextStep = path[1];
      this.attackingCoords = nextStep;
    }
  }

  draw() {
    const phase = Math.sin((this.animationTime / this.animationDuration) * 2 * Math.PI);
    drawEngine.ctx1.save();
    drawEngine.ctx1.globalAlpha = this.opacity;

    // Calculate attack movement offset
    let offsetX = 0;
    let offsetY = 0;
    if (this.attackingCoords) {
      const attackProgress = this.attackAnimationTime / this.attackAnimationDuration;
      
      // Calculate direction to target
      const dirX = this.attackingCoords.col - this.col;
      const dirY = this.attackingCoords.row - this.row;
      
      // Animation phase timings
      const windUpPhase = 0.7;  // wind up backwards
      const tacklePhase = 0.73;  // tackle forward  
      const returnPhase = 1.0;  // return to position
      
      // Movement distances in pixels
      const windUpDistance = 3;   // How far to move backwards
      const tackleDistance = CELL_WIDTH;  // How far to move forward
      
      if (attackProgress < windUpPhase) {
        // Wind-up phase: move backwards slowly
        const windupProgress = attackProgress / windUpPhase;
        offsetX = -dirX * windupProgress * windUpDistance;
        offsetY = -dirY * windupProgress * windUpDistance;
      } else if (attackProgress < tacklePhase) {
        // Tackle phase: quickly move forward
        const tackleProgress = (attackProgress - windUpPhase) / (tacklePhase - windUpPhase);
        const windupOffset = -windUpDistance;
        offsetX = dirX * (windupOffset + tackleDistance * tackleProgress);
        offsetY = dirY * (windupOffset + tackleDistance * tackleProgress);
      } else {
        // Return phase: come back to resting position
        const returnProgress = (attackProgress - tacklePhase) / (returnPhase - tacklePhase);
        const forwardOffset = windUpDistance;
        offsetX = dirX * forwardOffset * (1 - returnProgress);
        offsetY = dirY * forwardOffset * (1 - returnProgress);
      }

      offsetX = Math.round(offsetX);
      offsetY = Math.round(offsetY);
      
      if (attackProgress > 0.95) {
        this.attackingCoords = null;
        this.attackAnimationTime = 0;
      }
    }

    // Shadow
    const shadow = Math.round(2 + 1 * phase) / 10;
    drawEngine.ctx1.fillStyle = `rgba(0,0,0,${shadow})`;
    drawEngine.ctx1.fillRect(
      this.x + 3 + offsetX,
      this.y + CELL_HEIGHT * 3 / 4 + offsetY,
      this.icon.width - 6,
      CELL_HEIGHT / 4 + 1,
    );

    const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
    if (hpRatio < 1) {
      const barWidth = this.icon.width;
      const hpWidth = barWidth * hpRatio;
      const barHeight = 1;
      const barX = this.x;
      const barY = this.y - 5;

      drawEngine.ctx1.fillStyle = colors.blue1;
      drawEngine.ctx1.fillRect(barX, barY, Math.round(hpWidth), barHeight);
      drawEngine.ctx1.fillStyle = colors.blue2;
      drawEngine.ctx1.fillRect(barX, barY + 1, Math.round(hpWidth), barHeight);

      drawEngine.ctx1.fillStyle = colors.purple5;
      drawEngine.ctx1.fillRect(barX + Math.round(hpWidth), barY, Math.round(barWidth - hpWidth), barHeight);
      drawEngine.ctx1.fillStyle = colors.purple4;
      drawEngine.ctx1.fillRect(barX + Math.round(hpWidth), barY + 1, Math.round(barWidth - hpWidth), barHeight);
    }

    // Icon
    drawEngine.ctx1.save();
    drawEngine.ctx1.translate(
      offsetX,
      offsetY + Math.round(
        (phase - 1) * 2
      )
    );
    super.draw();
    drawEngine.ctx1.restore();
    drawEngine.ctx1.restore();
  }

  takeDamage(damage: number = 1): boolean {
    this.hp -= damage;
    if (this.hp <= 0) {
      addTimeEvent(() => {
        this.map.set(this.col, this.row, null);
        this.dead = true;
      }, 2000);
    }
    return this.hp <= 0;
  }
}
