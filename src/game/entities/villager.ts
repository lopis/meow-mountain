import { GameObject } from "@/core/game-object";
import { GameAssets, VillagerStates } from "../game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";
import { GameMap } from "../game-map";
import { House } from "./house";
import { emit } from "@/core/event";
import { colors } from "@/core/util/color";
import { drawEngine } from "@/core/draw-engine";

export class Villager extends GameObject<VillagerStates> {
  map: GameMap;
  home: House;
  atHome = true;
  lastDirection: { x: number; y: number } | null = null;
  moveTimer: number = 0;
  moveInterval: number = 1000;
  isScared = false;

  constructor(col: number, row: number, map: GameMap, home: House) {
    super(
      GameAssets.villager,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'villager',
      'idle',
      10,
    );
    this.map = map;
    this.home = home;
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
        emit('scared');
        this.emitParticle();
      }
      this.animation = 'scared';
      this.animationDuration = 50;
    } else {
      this.isScared = false;
      this.animationDuration = 150;
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
    emit('particle', particle);
  }

  // Looks around for an empty cell to move to.
  // Has 50% chance of moving forward in the same direction as before.
  // Otherwise moves in a random direction, if that direction is free. 
  takeNextStep(): void {
    if (this.atHome) {
      this.tryToLeaveHome();
      return;
    }

    const directions = [
      { x: 0, y: -1 }, // north
      { x: 0, y: 1 },  // south
      { x: 1, y: 0 },  // east
      { x: -1, y: 0 }  // west
    ];

    let targetDirection: { x: number; y: number } | null = null;

    // 80% chance to continue in the same direction if we have a last direction
    if (this.lastDirection && Math.random() < 0.8) {
      const newCol = this.col + this.lastDirection.x;
      const newRow = this.row + this.lastDirection.y;

      // Check if continuing in the same direction is valid
      if (this.isValidMove(newCol, newRow)) {
        targetDirection = this.lastDirection;
      }
    }

    // If we didn't choose to continue forward or it wasn't valid, try random directions
    if (!targetDirection) {
      // Shuffle directions for random selection
      const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);

      for (const dir of shuffledDirections) {
        const newCol = this.col + dir.x;
        const newRow = this.row + dir.y;

        if (this.isValidMove(newCol, newRow)) {
          targetDirection = dir;
          break;
        }
      }
    }

    // Move if we found a valid direction
    if (targetDirection) {
      const newCol = this.col + targetDirection.x;
      const newRow = this.row + targetDirection.y;

      // Update position
      this.col = newCol;
      this.row = newRow;
      this.targetPos = { x: newCol * CELL_WIDTH, y: newRow * CELL_HEIGHT };

      // Update last direction
      this.lastDirection = targetDirection;

      // Update animation
      this.animation = 'walk';
    } else {
      // No valid move found, stay idle
      this.animation = 'idle';
    }
  }

  tryToLeaveHome() {
    const frontOfHome = { col: this.home.col, row: this.home.row + 1 };
    if (!this.map.grid[frontOfHome.row][frontOfHome.col].content) {
      this.atHome = false;
      this.animation = 'idle';
      this.map.grid[frontOfHome.row][frontOfHome.col].content = this;
      this.setPos(frontOfHome.col, frontOfHome.row);
      this.y -= CELL_HEIGHT / 2;
    }
  }

  private isValidMove(col: number, row: number): boolean {
    // Check if cell is empty
    const cell = this.map.grid[row][col];
    return cell.content === null;
  }

  /**
   * Checks the 9 squares in front of it, in the direction it is moving.
   * Also checks the 8 squares around it.
   * If there's a cat in any of them, immediately return true.
   * Otherwise return false.
   */
  seesCat(): boolean {
    // Get all cells to check
    const cellsToCheck: Array<{ col: number; row: number }> = [];

    // 8 squares around the villager
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip own position
        cellsToCheck.push({ col: this.col + dx, row: this.row + dy });
      }
    }

    // 9 squares in front (if we have a movement direction)
    if (this.lastDirection) {
      const frontCol = this.col + this.lastDirection.x;
      const frontRow = this.row + this.lastDirection.y;

      // Add the 3x3 grid in front
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          cellsToCheck.push({
            col: frontCol + dx,
            row: frontRow + dy
          });
        }
      }
    }

    // Check each cell for a cat
    for (const { col, row } of cellsToCheck) {
      // Bounds check
      if (row < 0 || row >= this.map.rowCount || col < 0 || col >= this.map.colCount) {
        continue;
      }

      const cell = this.map.grid[row][col];
      if (cell.content?.type === 'cat') {
        return true;
      }
    }

    return false;
  }
}
