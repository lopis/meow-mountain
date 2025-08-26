import { emojiToPixelArt } from "@/core/emoji";
import { Icon } from "./icon";
import { drawEngine } from "@/core/draw-engine";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";
import { GameMap } from "../game-map";
import { findPath, Position } from "@/core/util/path-findind";
import { updatePositionSmoothly, SmoothMovementState, setTargetPosition } from "@/utils/smooth-movement";

export type SpiritType = '👻' | '👹' | '🧿' | '🦀' | '🌵' | '🥨' | '🧚🏻‍♀️' | '💀';

interface SpiritSpecies {
  type: SpiritType,
  icon: HTMLImageElement,
  level: 1 | 2 | 3,
}

export const spirits: Record<SpiritType, SpiritSpecies> = {
  '🌵': {
    icon: emojiToPixelArt('🌵'),
    type: '🌵',
    level: 1,
  },
  '🥨': {
    icon: emojiToPixelArt('🥨'),
    type: '🥨',
    level: 1,
  },
  '🧚🏻‍♀️': {
    icon: emojiToPixelArt('🧚🏻‍♀️'),
    type: '🧚🏻‍♀️',
    level: 1,
  },
  '🦀': {
    icon: emojiToPixelArt('🦀'),
    type: '🦀',
    level: 2,
  },
  '👻': {
    icon: emojiToPixelArt('👻'),
    type: '👻',
    level: 2,
  },
  '👹': {
    icon: emojiToPixelArt('👹'),
    type: '👹',
    level: 3,
  },
  '🧿': {
    icon: emojiToPixelArt('🧿'),
    type: '🧿',
    level: 3,
  },
  '💀': {
    icon: emojiToPixelArt('💀'),
    type: '💀',
    level: 3,
  },
}

export class Spirit extends Icon implements SmoothMovementState {
  animationDuration = 2000;
  animationTime = 0;
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
        if (searchCol >= 0 && searchCol < this.map.width && 
            searchRow >= 0 && searchRow < this.map.height) {
          
          const cell = this.map.grid[searchRow][searchCol];
          if (cell.content?.type === 'cat') {
            playerFound = true;
            this.isChasing = true;
            this.playerTarget = { col: searchCol, row: searchRow };
            console.log('found the player');
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

  private moveTowardsPlayer() {
    if (!this.playerTarget) {
      return;
    }

    // Find path to the player using spirit-specific pathfinding
    const path = this.findSpiritPath();

    if (!path || path.length <= 1) {
      // No path found or already at target
      return;
    }

    // Get the next step in the path (skip current position)
    const nextStep = path[1];
    const newCol = nextStep.x;
    const newRow = nextStep.y;

    // Check if the new position is valid
    if (this.isValidMove(newCol, newRow)) {
      // Calculate movement direction before updating position
      const deltaCol = newCol - this.col;
      const deltaRow = newRow - this.row;
      
      // Update spirit grid position
      this.col = newCol;
      this.row = newRow;
      
      // Set movement direction for visual feedback
      this.moving.x = Math.sign(deltaCol);
      this.moving.y = Math.sign(deltaRow);
      
      // Set target pixel position for smooth movement
      setTargetPosition(this, newCol, newRow);
    }
  }

  private findSpiritPath(): Position[] | null {
    const start = { x: this.col, y: this.row };
    const maxSteps = this.searchRadius * 2;
    
    const height = this.map.height;
    const width = this.map.width;

    if (width === 0 || height === 0) return null;
    if (start.y < 0 || start.y >= height || start.x < 0 || start.x >= width) return null;

    // Check if starting position is the target
    if (this.map.grid[start.y][start.x].content?.type === 'cat') {
      return [start];
    }

    const visited = new Set<string>();
    const queue: Array<{ position: Position; distance: number; previous?: any }> = [{ position: start, distance: 0 }];
    visited.add(`${start.x},${start.y}`);

    // Directions: north, south, east, west
    const directions = [
      { x: 0, y: -1 }, // north
      { x: 0, y: 1 },  // south
      { x: 1, y: 0 },  // east
      { x: -1, y: 0 }  // west
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Check all 4 directions
      for (const dir of directions) {
        const newX = current.position.x + dir.x;
        const newY = current.position.y + dir.y;
        const newDistance = current.distance + 1;

        // Check bounds and max steps
        if (newX < 0 || newX >= width || newY < 0 || newY >= height || newDistance > maxSteps) {
          continue;
        }

        const key = `${newX},${newY}`;
        if (visited.has(key)) {
          continue;
        }

        visited.add(key);

        const newNode = {
          position: { x: newX, y: newY },
          distance: newDistance,
          previous: current
        };

        // Check if this cell contains the player
        if (this.map.grid[newY][newX].content?.type === 'cat') {
          // Reconstruct path
          const path: Position[] = [];
          let node: any = newNode;
          while (node) {
            path.unshift(node.position);
            node = node.previous;
          }
          return path;
        }

        // Add to queue for further exploration
        queue.push(newNode);
      }
    }

    return null; // No path found within maxSteps
  }

  private isValidMove(col: number, row: number): boolean {
    // Check bounds
    if (col < 0 || col >= this.map.width || row < 0 || row >= this.map.height) {
      return false;
    }

    const cell = this.map.grid[row][col];
    
    // Spirits can only move to empty cells
    return cell.content === null;
  }

  draw() {
    const phase = Math.sin((this.animationTime / this.animationDuration) * 2 * Math.PI);

    // Shadow
    const shadow = Math.round(2 + 1 * phase) / 10
    drawEngine.ctx1.fillStyle = `rgba(0,0,0,${shadow})`;
    drawEngine.ctx1.fillRect(
      this.x + 3,
      this.y + CELL_HEIGHT * 3 / 4,
      this.icon.width - 6,
      CELL_HEIGHT / 4 + 1,
    )

    // Icon
    drawEngine.ctx1.save();
    drawEngine.ctx1.translate(
      0,
      Math.round(
        (phase - 1) * 2
      )
    )
    super.draw();
    drawEngine.ctx1.restore();
  }
}
