import { SeededRandom } from '@/core/util/rng';
import { House } from './house';
import { GameMap } from '../game-map';
import { Villager } from './villager';
import { Farm } from './farm';

export class Village {
  houses: House[] = [];
  farms: Farm[] = [];
  villagers: Villager[] = [];

  constructor(
    public name: string,
    public center: { x: number; y: number },
    public radius: number,
    public houseCount: number,
    public population: number,
  ) {
    this.center = center;
    this.radius = radius;
  }

  update(timeElapsed: number) {
    // Update villagers that are not on the grid, but inside houses
    this.houses.forEach((house) => {
      house.residents.forEach((villager) => {
        if (villager.atHome) {
          villager.update(timeElapsed);
        }
      });
    });
  }

  private generatePosition(rng: SeededRandom, existing: { x: number; y: number }[]): { x: number; y: number } {
    let col: number;
    let row: number;
    do {
      const angle = rng.range(0, Math.PI * 2);
      const distance = rng.range(1, this.radius - 1);
      col = Math.round(this.center.x + Math.cos(angle) * distance);
      row = Math.round(this.center.y + Math.sin(angle) * distance);
    } while (
      col < 0 ||
      row < 0 ||
      existing.some(item => item.x === col && item.y === row)
    );
    return { x: col, y: row };
  }

  generateHouses(rng: SeededRandom): House[] {
    for (let i = 0; i < this.houseCount; i++) {
      const pos = this.generatePosition(rng, this.houses);
      const houseCol = pos.x + pos.x % 2;
      const houseRow = pos.y + pos.y % 2;
      this.houses.push(new House(houseCol, houseRow));
    }
    return this.houses;
  }

  generateFarms(rng: SeededRandom): Farm[] {
    const farmCount = Math.ceil(this.houseCount / 3);
    for (let i = 0; i < farmCount; i++) {
      const pos = this.generatePosition(rng, this.farms);
      
      // Create a 2x2 farm block
      for (let dx = 0; dx < 2; dx++) {
        for (let dy = 0; dy < 2; dy++) {
          this.farms.push(new Farm(pos.x + dx, pos.y + dy));
        }
      }
    }
    return this.farms;
  }

  generateVillagers(map: GameMap): Villager[] {
    const residents = this.population / this.houseCount;
    this.houses.forEach(house => {
      while (house.residents.length < residents) {
        const villager = new Villager(house.col, house.row, map, house);
        house.residents.push(villager);
        this.villagers.push(villager);
      }
    });
    return this.villagers;
  }
}
