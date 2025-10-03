/* eslint-disable max-classes-per-file */
import { GameAssets } from '../game-assets';
import { CELL_HEIGHT, CELL_WIDTH, MAX_REPAIR } from '../constants';
import { Spirit, spirits } from './spirit';
import { GameMap } from '../game-map';
import { GameData } from '../game-data';
import { drawHpBar } from './hp-bar';
import { colors } from '@/core/util/color';
import { drawEngine } from '@/core/draw-engine';
import { GameStaticObject } from '@/core/game-static-object';
import { MagicCircleAnimation } from './magic-animation';
import { addTimeEvent } from '@/core/timer';

export class Statue extends GameStaticObject {
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
  animationTime = 0;
  spiritsExorcised = false;
  lastClearTime = 0;

  magicCircleAnimation: MagicCircleAnimation | null = null;

  /**
   * Animation duration
   */
  aD = 800;

  constructor(
    col: number,
    row: number,
    public map: GameMap,
    public gameData: GameData,
    public name: string,
  ) {
    super(
      GameAssets.statue,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'statue',
    );
  }

  updateAnimation(timeElapsed: number) {
    this.animationTime += timeElapsed;
  }

  update(timeElapsed: number) {
    this.spawnTimer += timeElapsed;

    if (this.state === Statue.State.BROKEN && this.repair >= MAX_REPAIR) {
      this.state = Statue.State.ANIMATING;
      this.spiritsExorcised = false; // Reset flag when starting animation
      this.lastClearTime = 0; // Reset clear timer
      this.magicCircleAnimation = new MagicCircleAnimation(this.x, this.y);
    } else if (this.magicCircleAnimation) {
      this.magicCircleAnimation.update(timeElapsed);
      if (this.magicCircleAnimation.isDone) {
        this.state = Statue.State.REPAIRED;
        this.magicCircleAnimation = null;
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
    super.draw();
    if (this.repair > 0 && this.repair < MAX_REPAIR) {
      drawHpBar(this.repair, MAX_REPAIR, this.x, this.y, [colors.yellow1, colors.yellow2, colors.blue5, colors.blue6]);
    }
    if (this.state === Statue.State.REPAIRED) {
      this.drawFaries();
    }
  }

  postDraw() {
    if (this.magicCircleAnimation) {
      this.magicCircleAnimation.draw();
    
      if (this.magicCircleAnimation.animationTimer - this.lastClearTime >= 20) {
        const progress = this.magicCircleAnimation.progress;
        this.map.clearCircleWithJitter(this.col, this.row, 20 * progress, true, 2, 0.3);
        this.lastClearTime = this.magicCircleAnimation.animationTimer;
      }
      
      // Only exorcise spirits once at the beginning of the animation
      if (!this.spiritsExorcised) {
        this.spirits.forEach((spirit, i) => {
          addTimeEvent(() => {
            spirit.takeDamage(spirit.hp);
          }, i * 100);
        });
        this.spiritsExorcised = true;
      }
    }
  }

  drawFaries() {
    const radius = 3;
    drawEngine.ctx1.fillStyle = colors.purple0;
    
    for (let i = 0; i < 5; i++) {
      const t = (this.animationTime + this.aD * 0.5 * i) / this.aD;
      const theta = (i * 2 * Math.PI) / 3; // 0, 120°, 240°
      // Offset distance from statue center
      const offsetDist = 3; // adjust as needed
      const offsetX = Math.cos(theta) * offsetDist;
      const offsetY = Math.sin(theta) * offsetDist;

      // Infinity path at t, rotated by theta
      const x0 = radius * 2 * Math.sin(t);
      const y0 = radius * Math.sin(2 * t);
      const x = x0 * Math.cos(theta) - y0 * Math.sin(theta);
      const y = x0 * Math.sin(theta) + y0 * Math.cos(theta);

      // Final position: statue center + offset + rotated path
      const px = Math.round(this.x + CELL_WIDTH / 2 + offsetX + x);
      const py = Math.round(this.y + CELL_HEIGHT / 3 + offsetY + y);

      drawEngine.ctx1.fillRect(px, py, 1, 1);
    }
  }

  private spawnSpirit() {
    // Find a random empty cell within a 20x20 area around the statue
    const emptyCells: { x: number; y: number }[] = [];
    const spawnRadius = Math.round(this.gameData.getLevel() + this.spawnRadius);
    
    // Collect all empty cells within the search radius
    for (let dx = -spawnRadius; dx <= spawnRadius; dx++) {
      for (let dy = -spawnRadius; dy <= spawnRadius; dy++) {
        const x = this.col + dx;
        const y = this.row + dy;
        
        // Check if cell is empty
        if (this.map.grid[y][x].content === null) {
          emptyCells.push({ x, y });
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
