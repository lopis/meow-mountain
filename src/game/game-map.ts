import { Tree } from "./entities/tree";
import { SeededRandom } from "@/core/util/rng";
import { Village } from "./entities/village";
import { CELL_HEIGHT, CELL_WIDTH, clearings, paths, statues } from "./constants";
import { Statue } from "./entities/statue";
import { Cell, Drawable } from "./types";
import { on } from "@/core/event";
import { Spirit } from "./entities/spirit";
import { Coords } from "./path-findind";
import { drawEngine } from "@/core/draw-engine";
import { GameAssets } from "./game-assets";
import { GameData } from "./game-data";

export class GameMap {
  grid: Cell[][];
  villages: Village[] = [];
  private rng: SeededRandom;
  playerLookingAt: Coords = { col: 0, row: 0 };

  constructor(
    public readonly colCount: number,
    public readonly rowCount: number,
    public gameData: GameData,
  ) {
    this.rng = new SeededRandom();


    this.grid = Array.from({ length: rowCount }, (_a, y) =>
      Array.from({ length: colCount }, (_b, x) => {
        // Determine tree species based on distance from Heart Peak (70, 90)
        const dx = x - 70;
        const dy = y - 90;
        const distanceFromHeartPeak = Math.sqrt(dx * dx + dy * dy);
        
        let treeType: 'oak' | 'spruce';
        if (distanceFromHeartPeak <= 20) {
          // Within 20 cell radius of Heart Peak: 90% spruce, 10% oak
          treeType = this.rng.next() < 0.9 ? 'spruce' : 'oak';
        } else {
          // Rest of map: 20% spruce, 80% oak
          treeType = this.rng.next() < 0.2 ? 'spruce' : 'oak';
        }
        
        const tree = new Tree(
          x * CELL_WIDTH - (16 - CELL_WIDTH) / 2, // Adjust x to center the image
          y * CELL_HEIGHT - (16 - CELL_HEIGHT) / 2, // Adjust y to center the image
          treeType
        );
        return { x, y, content: tree };
      })
    );

    this.villages = [
      new Village("Heart Peak", { x: 70, y: 90 }, 4, 1, 0),
      new Village("Moon Plains", { x: 129, y: 29 }, 8, 10, 20),
    ];

    // Clear paths with jitter
    for (const path of paths) {
      for (let i = 0; i < path.length - 1; i++) {
        const from = { x: path[i][0], y: path[i][1] };
        const to = { x: path[i + 1][0], y: path[i + 1][1] };
        const pathWidth = path[i][2];
        this.clearPathWithJitter(from, to, pathWidth);
      }
    }

    // Clear circular areas with jitter
    for (const clearing of clearings) {
      this.clearCircleWithJitter(clearing.x, clearing.y, clearing.r);
    }

    for (const statueProps of Object.values(statues)) {
      const { x, y, name } = statueProps;
      const fullName = `cat ${name} altar`;
      const statue = new Statue(x, y, this, this.gameData, fullName);
      if (x === statues.heart.x) {
        statue.maxSpirits = 0;
      }
      this.grid[y][x].content = statue;
    }

    // Calculate neighbor information for each tree
    for (let y = 0; y < rowCount; y++) {
      for (let x = 0; x < colCount; x++) {
        const cell = this.grid[y][x];
        if (cell.content instanceof Tree) {
          const neighbors = {
            top: this.grid[y - 1]?.[x]?.content instanceof Tree,
            bottom: this.grid[y + 1]?.[x]?.content instanceof Tree,
            left: this.grid[y]?.[x - 1]?.content instanceof Tree,
            right: this.grid[y]?.[x + 1]?.content instanceof Tree,
          };
          cell.content.setNeighbors(neighbors);
        }
      }
    }

    for (const village of this.villages) {
      village.generateFarms(this.rng)
        .forEach(farm => {
          this.grid[farm.row][farm.col].content = farm;
        });
      village.generateHouses(this.rng)
        .forEach(house => {
          this.grid[house.row][house.col].content = house;
        });
      village.generateVillagers(this);
    }

    on('spawn-first-spirit', () => {
      this.set(64, 89, new Spirit(64, 89, '🎈', this));
    });
  }

  getLookingAt() {
    return this.grid[this.playerLookingAt.row][this.playerLookingAt.col];
  }

  private clearPathWithJitter(
    from: { x: number, y: number },
    to: { x: number, y: number },
    pathWidth: number,
  ) {
    // Bresenham's line algorithm for any angle
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;
    let err = dx - dy;

    let x = from.x;
    let y = from.y;

    const halfWidth = pathWidth / 2;

    while (true) {
      // Add jitter to the clearing area
      const jitterAmount = pathWidth < 1 ? 0 : 1.2; // Adjust for more/less randomness
      const jitterX = Math.ceil(this.rng.range(-jitterAmount, jitterAmount));
      const jitterY = Math.ceil(this.rng.range(-jitterAmount, jitterAmount));

      // Clear area around the current position with jitter
      for (let ox = -halfWidth; ox <= halfWidth; ox++) {
        for (let oy = -halfWidth; oy <= halfWidth; oy++) {
          const clearX = Math.ceil(x + ox + jitterX);
          const clearY = Math.ceil(y + oy + jitterY);
          if (clearY >= 0 && clearY < this.grid.length &&
            clearX >= 0 && clearX < this.grid[0].length) {
            this.grid[clearY][clearX].content = null;
            if (pathWidth < 1) {
              this.grid[clearY][clearX + 1].content = null;
            } else if (this.rng.next() > 0.1) {
              // Add probability for partial clearing to create natural edges
              this.grid[clearY][clearX].content = null;
            }
          }
        }
      }

      // Check if we've reached the destination
      if (x === to.x && y === to.y) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  private clearCircleWithJitter(centerX: number, centerY: number, radius: number) {
    for (let y = 0; y < this.rowCount; y++) {
      for (let x = 0; x < this.colCount; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Add jitter to radius for natural edge
        const jitterRadius = this.rng.range(-radius, radius) / 6;
        const adjustedRadius = radius + jitterRadius;

        if (distance <= adjustedRadius) {
          // Add probability for partial clearing near edges
          const edgeDistance = adjustedRadius - distance;
          const clearProbability = Math.min(1, edgeDistance / 2 + 0.7);

          if (this.rng.next() < clearProbability) {
            this.grid[y][x].content = null;
          }
        }
      }
    }
  }

  set(x: number, y: number, content: Drawable | null) {
    if (this.grid[y] && this.grid[y][x]) {
      this.grid[y][x].content = content;
    }
  }

  update(timeElapsed: number) {
    for (const row of this.grid) {
      for (const cell of row) {
        if (cell.content) {
          cell.content.update?.(timeElapsed);
          if (cell.x != cell.content.col || cell.y != cell.content.row) {
            this.grid[cell.content.row][cell.content.col].content = cell.content;
            cell.content = null;
          }
          if (cell.content && (cell?.content as Spirit)?.dead) {
            this.set(cell.content.col, cell.content.row, null);
          }
        }
      }
    }
    this.villages.forEach((village) => village.update(timeElapsed));
  }

  draw(cx: number, cy: number) {
    // Calculate rectangular render distance based on canvas size and current zoom
    const zoom = drawEngine.zoom;
    const renderWidth = (drawEngine.canvasWidth / zoom) / 2 + 50; // Add buffer
    const renderHeight = (drawEngine.canvasHeight / zoom) / 2 + 50; // Add buffer
    
    // Keep circular "seen" radius for minimap
    const seenRadius = 75;
    const seenRadiusSquared = seenRadius * seenRadius;

    for (const row of this.grid) {
      for (const cell of row) {
        const x = cell.x * CELL_WIDTH;
        const y = cell.y * CELL_HEIGHT;
        const dx = x - cx;
        const dy = y - cy;

        // Use circular bounds for "seen" detection (minimap)
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared <= seenRadiusSquared) {
          cell.seen = true;
        }

        if (
          cell.y === this.playerLookingAt.row &&
          cell.x === this.playerLookingAt.col &&
          cell.content &&
          !['oak', 'spruce'].includes(cell.content.type)
        ) {
          drawEngine.drawBackgroundImage(
            GameAssets.cornerImage,
            x - (16 - CELL_WIDTH) / 2,
            y - (16 - CELL_HEIGHT) / 2
          );
        }
        
        // Use rectangular bounds for rendering
        if (Math.abs(dx) <= renderWidth && Math.abs(dy) <= renderHeight) {
          cell?.content?.draw();
        }
      }
    }
  }
}
