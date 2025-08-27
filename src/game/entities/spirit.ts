import { emojiToPixelArt } from "@/core/emoji";
import { Icon } from "./icon";
import { drawEngine } from "@/core/draw-engine";
import { CELL_HEIGHT } from "../constants";
import { GameMap } from "../game-map";
import { updatePositionSmoothly, SmoothMovementState } from "@/utils/smooth-movement";

export type SpiritType = '👻' | '👹' | '🧿' | '🦀' | '🌵' | '🥨' | '🧚🏻‍♀️' | '💀';

interface SpiritSpecies {
  type: SpiritType,
  icon: HTMLImageElement,
  level: number,
}

export const spirits = ([
  '🌵', '🥨', '🧚🏻‍♀️', '🦀', '👻', '👹', '🧿', '💀'
] as const).reduce<Record<SpiritType, SpiritSpecies>>((acc, type, index) => {
  acc[type] = { icon: emojiToPixelArt(type), type, level: Math.ceil((index + 1) / 2) };
  return acc;
}, {} as Record<SpiritType, SpiritSpecies>);

export class Spirit extends Icon implements SmoothMovementState {
  animationDuration = 2000;
  animationTime = 0;
  opacity = 0;
  species: SpiritSpecies;
  map: GameMap;
  searchRadius = 7; // Search in a 6x6 box around the spirit
  isChasing = false;
  moveTimer = 0;
  moveInterval = 800; // Time between moves when chasing
  targetPos: { x: number; y: number };
  moving = { x: 0, y: 0 };
  speed = 50; // Pixels per second
  playerTarget: { col: number; row: number } | null = null;

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
  }

  update(timeElapsed: number) {
    this.animationTime += timeElapsed * Math.pow(this.species.level, 2);
    if (this.opacity < 1) {
      this.opacity += timeElapsed / this.animationDuration;
    }
    if (this.animationTime >= this.animationDuration) {
      this.animationTime -= this.animationDuration;
    }

    // Update smooth movement
    updatePositionSmoothly(this, timeElapsed);

    // Search for the player in a box around the spirit
    this.searchForPlayer();

    // Handle movement when chasing
    if (this.isChasing) {
      this.moveTimer += timeElapsed;
      if (this.moveTimer >= this.moveInterval) {
        this.moveTowardsPlayer();
        this.moveTimer = 0;
      }
    }
  }

  private searchForPlayer() {
    let playerFound = false;
    
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
            playerFound = true;
            this.isChasing = true;
            this.playerTarget = { col: searchCol, row: searchRow };
            return; // Exit early once player is found
          }
        }
      }
    }
    
    // If player not found, stop chasing
    if (!playerFound) {
      this.isChasing = false;
      this.playerTarget = null;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private moveTowardsPlayer() {
    // TODO: implement path finding towards the player.
  }

  draw() {
    const phase = Math.sin((this.animationTime / this.animationDuration) * 2 * Math.PI);
    drawEngine.ctx1.save();
    drawEngine.ctx1.globalAlpha = this.opacity;

    // Shadow
    const shadow = Math.round(2 + 1 * phase) / 10;
    drawEngine.ctx1.fillStyle = `rgba(0,0,0,${shadow})`;
    drawEngine.ctx1.fillRect(
      this.x + 3,
      this.y + CELL_HEIGHT * 3 / 4,
      this.icon.width - 6,
      CELL_HEIGHT / 4 + 1,
    );

    // Icon
    drawEngine.ctx1.save();
    drawEngine.ctx1.translate(
      0,
      Math.round(
        (phase - 1) * 2
      )
    );
    super.draw();
    drawEngine.ctx1.restore();
    drawEngine.ctx1.restore();
  }
}
