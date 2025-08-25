import { GameObject } from "@/core/game-object";
import { GameAssets, VillagerStates } from "../game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";
import { GameMap } from "../game-map";
import { House } from "./house";

export class Villager extends GameObject<VillagerStates> {
  map: GameMap;
  home: House;
  atHome = true;
  lastDirection: { x: number; y: number } | null = null;
  moveTimer: number = 0;
  moveInterval: number = 1000;

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
    if (this.moveTimer >= this.moveInterval) {
      this.takeNextStep();
      this.moveTimer = 0;
    }
    this.updatePositionSmoothly(timeElapsed);
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

      for (const direction of shuffledDirections) {
        const newCol = this.col + direction.x;
        const newRow = this.row + direction.y;

        if (this.isValidMove(newCol, newRow)) {
          targetDirection = direction;
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
    debugger
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
}
