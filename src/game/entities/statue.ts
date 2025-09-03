/* eslint-disable max-classes-per-file */
import { GameObject } from '@/core/game-object';
import { Asset, GameAssets } from '../game-assets';
import { CELL_HEIGHT, CELL_WIDTH, MAX_REPAIR } from '../constants';
import { Spirit, spirits } from './spirit';
import { GameMap } from '../game-map';
import { GameData } from '../game-data';
import { drawHpBar } from './hp-bar';
import { colors } from '@/core/util/color';
import { drawEngine } from '@/core/draw-engine';

export class Statue extends GameObject<Asset> {
  static readonly State = {
    BROKEN: 0,
    ANIMATING: 1,
    REPAIRED: 2
  } as const;

  spirits: Spirit[] = [];
  maxSpirits = 4;
  spawnTimer = 0;
  spawnInterval = 1000;
  spawnChance = 0.10;
  spawnRadius = 10;
  repair = 0;
  state: number = Statue.State.BROKEN;
  repairAnimationDuration = 1500;
  repairAnimationTimer = 0;

  constructor(
    col: number,
    row: number,
    public map: GameMap,
    public gameData: GameData,
    public name: string,
  ) {
    super(
      GameAssets.assets,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'statue',
      'statue',
    );
  }

  update(timeElapsed: number) {
    this.spawnTimer += timeElapsed;

    if (this.state === Statue.State.BROKEN && this.repair >= MAX_REPAIR) {
      this.state = Statue.State.ANIMATING;
    } else if (this.state === Statue.State.ANIMATING) {
      this.repairAnimationTimer += timeElapsed;
      if (this.repairAnimationTimer > this.repairAnimationDuration) {
        this.state = Statue.State.REPAIRED;
      }
    }
    
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;

      if (Math.random() < this.spawnChance) {
        if (this.spirits.length < (this.maxSpirits + this.gameData.getLevel())) {
          // Spawn new spirit
          this.spawnSpirit();
        } else if (this.spirits.length > 0) {
          // Replace spirits with full HP
          const replaceSpirit = this.spirits
            .filter((spirit) => spirit.hp === spirit.maxHp)
            [Math.round(Math.random() * this.spirits.length - 1)];
          if (replaceSpirit) {
            replaceSpirit.dead = true;
            this.spawnSpirit();
          }
        }
      }
    }

    this.spirits = this.spirits.filter(spirit => !spirit.dead);
  }

  draw() {
    if (this.state === Statue.State.ANIMATING) {
      this.drawAnimation();
    }
    super.draw();
    if (this.repair > 0 && this.repair < MAX_REPAIR) {
      drawHpBar(this.repair, MAX_REPAIR, this.x, this.y, [colors.yellow1, colors.yellow2, colors.blue4, colors.blue5]);
    }
  }

  drawAnimation() {
    const animationProgress = (3 * this.repairAnimationTimer / this.repairAnimationDuration) % 1;
    
    const maxWidth = c1.width / drawEngine.zoom;
    const maxHeight = c1.height / drawEngine.zoom;
    drawEngine.drawCircumference(
      drawEngine.ctx1,
      this.x + CELL_WIDTH / 2,
      this.y + CELL_HEIGHT / 2,
      maxWidth * animationProgress,
      maxHeight * animationProgress,
      colors.white,
      8,
    );
  }

  private spawnSpirit() {
    // Find a random empty cell within a 20x20 area around the statue
    const emptyCells: { x: number; y: number }[] = [];
    const spawnRadius = this.gameData.getLevel() + this.spawnRadius;
    
    // Collect all empty cells within the search radius
    for (let dx = -spawnRadius; dx <= spawnRadius; dx++) {
      for (let dy = -spawnRadius; dy <= spawnRadius; dy++) {
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
      const spiritTypes = Object.values(spirits)
        .filter((spirit) => spirit.level < this.gameData.getLevel());
      if (spiritTypes.length === 0) return;

      const randomType = spiritTypes[Math.floor(Math.random() * spiritTypes.length)];
      
      const spirit = new Spirit(selectedPosition.x, selectedPosition.y, randomType.type, this.map);
      this.spirits.push(spirit);
      
      // Place the spirit directly in the map
      this.map.set(selectedPosition.x, selectedPosition.y, spirit);
    }
  }
}
