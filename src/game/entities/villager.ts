import { GameObject } from '@/core/game-object';
import { GameAssets, VillagerStates } from '../game-assets';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';
import { GameMap } from '../game-map';
import { emit } from '@/core/event';
import { colors } from '@/core/util/color';
import { drawEngine } from '@/core/draw-engine';
import { GameEvent } from '../event-manifest';

export class Villager extends GameObject<VillagerStates> {
  lastDirection: { x: number; y: number } | null = null;
  moveTimer: number = 0;
  moveInterval: number = 1000;
  isScared = false;

  constructor(col: number, row: number, private map: GameMap) {
    super(
      GameAssets.villager,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'villager',
      'idle',
      10,
    );
  }

  update(timeElapsed: number): void {
    super.update(timeElapsed);

    this.moveTimer += timeElapsed;
    if (this.seesCat()) {
      if (!this.isScared && this.moveTimer >= this.moveInterval) {
        this.moveTimer = 0;
        this.isScared = true;
      }
      if (this.moveTimer % (this.moveInterval / 5) < timeElapsed) {
        emit(GameEvent.SCARED);
        this.emitParticle();
      }
      this.animation = 'scared';
      this.aD = 50;
    } else {
      this.isScared = false;
      this.aD = 150;
      if (this.moveTimer >= this.moveInterval) {
        this.takeNextStep();
        this.moveTimer = 0;
      }
      this.updatePositionSmoothly(timeElapsed);
    }
  }

  emitParticle() {
    // Convert world coordinates to screen coordinates for the particle
    const screenPos = drawEngine.worldToScreen(
      this.x + CELL_WIDTH / 2,
      this.y
    );

    // Target the center of the superstition bar in the HUD
    const superstitionBarX = drawEngine.canvasWidth / 2;
    const superstitionBarY = 30;

    const particle = {
      from: {
        x: screenPos.x - 10 + Math.round(Math.random() * 20),
        y: screenPos.y - 50 + Math.round(Math.random() * 100),
      },
      to: {
        x: superstitionBarX,
        y: superstitionBarY,
      },
      size: 5 + Math.round(Math.random() * 5),
      color: colors.blue4,
      duration: 500,
    };
    emit(GameEvent.PARTICLE, particle);
  }

  // Looks around for an empty cell to move to.
  // Has 50% chance of moving forward in the same direction as before.
  // Otherwise moves in a random direction, if that direction is free. 
  takeNextStep(): void {
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 }, 
      { x: 1, y: 0 },
      { x: -1, y: 0 }
    ];

    // 80% chance to continue in same direction
    if (this.lastDirection && Math.random() < 0.8) {
      const newCol = this.col + this.lastDirection.x;
      const newRow = this.row + this.lastDirection.y;
      if (this.isValidMove(newCol, newRow)) {
        this.col = newCol;
        this.row = newRow;
        this.targetPos = { x: newCol * CELL_WIDTH, y: newRow * CELL_HEIGHT };
        this.lastDirection = this.lastDirection;
        this.animation = 'walk';
        return;
      }
    }

    // Try random directions without shuffling
    for (let i = 0; i < 10; i++) {
      const dir = directions[Math.floor(Math.random() * 4)];
      const newCol = this.col + dir.x;
      const newRow = this.row + dir.y;
      if (this.isValidMove(newCol, newRow)) {
        this.col = newCol;
        this.row = newRow;
        this.targetPos = { x: newCol * CELL_WIDTH, y: newRow * CELL_HEIGHT };
        this.lastDirection = dir;
        this.animation = 'walk';
        return;
      }
    }

    this.animation = 'idle';
  }

  private isValidMove(col: number, row: number): boolean {
    // Check if cell is empty
    const cell = this.map.grid[row][col];
    return cell.content === null;
  }

  /**
   * Checks 2 cells in front in the movement direction for a cat.
   */
  seesCat(): boolean {
    if (!this.lastDirection) return false;

    for (let i = 1; i <= 2; i++) {
      const checkCol = this.col + this.lastDirection.x * i;
      const checkRow = this.row + this.lastDirection.y * i;
      
      const cell = this.map.grid[checkRow]?.[checkCol];
      if (cell?.content?.type === 'cat') {
        return true;
      }
    }

    return false;
  }
}
