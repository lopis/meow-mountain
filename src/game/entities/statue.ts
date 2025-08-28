import { GameObject } from "@/core/game-object";
import { Asset, GameAssets } from "../game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";
import { Spirit, spirits, SpiritType } from "./spirit";
import { GameMap } from "../game-map";

export class Statue extends GameObject<Asset> {
  spirits: Spirit[] = [];
  maxSpirits = 9;
  spawnTimer = 0;
  spawnInterval = 100; // 100ms
  spawnChance = 0.105; // 10%
  spawnRadius = 10;
  map!: GameMap;

  constructor(col: number, row: number, map: GameMap) {
    super(
      GameAssets.assets,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'statue',
      'statue'
    );
    this.map = map;
  }

  update(timeElapsed: number) {
    this.spawnTimer += timeElapsed;
    
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      
      // 10% chance to spawn a spirit if under max limit
      if (this.spirits.length < this.maxSpirits && Math.random() < this.spawnChance) {
        this.spawnSpirit();
      }
    }

    this.spirits = this.spirits.filter(spirit => !spirit.dead);
  }

  private spawnSpirit() {
    if (!this.map) {
      return; // Can't spawn without map reference
    }

    // Find a random empty cell within a 20x20 area around the statue
    const emptyCells: { x: number; y: number }[] = [];
    
    // Collect all empty cells within the search radius
    for (let dx = -this.spawnRadius; dx <= this.spawnRadius; dx++) {
      for (let dy = -this.spawnRadius; dy <= this.spawnRadius; dy++) {
        const x = this.col + dx;
        const y = this.row + dy;
        
        // Check bounds
        if (x >= 0 && x < this.map.colCount && y >= 0 && y < this.map.rowCount) {
          // Check if cell is empty
          if (this.map.grid[y][x].content === null) {
            emptyCells.push({ x, y });
          }
        }
      }
    }

    // Select a random empty cell
    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const selectedPosition = emptyCells[randomIndex];
      
      // TODO: only spawn spirits of the appropriate level for the current game
      const spiritTypes = Object.keys(spirits) as SpiritType[];
      const randomType = spiritTypes[Math.floor(Math.random() * spiritTypes.length)];
      
      const spirit = new Spirit(selectedPosition.x, selectedPosition.y, randomType, this.map);
      this.spirits.push(spirit);
      
      // Place the spirit directly in the map
      this.map.set(selectedPosition.x, selectedPosition.y, spirit);
    }
  }

  getSpirits(): Spirit[] {
    return [...this.spirits];
  }
}
