import { SeededRandom } from "@/core/util/rng";
import { House } from "./house";
import { GameMap } from "../game-map";
import { Villager } from "./villager";
import { Farm } from "./farm";

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
      })
    })
  }

  generateHouses(rng: SeededRandom): House[] {
    for (let i = 0; i < this.houseCount; i++) {
      let houseCol: number;
      let houseRow: number;
      do {
        const angle = rng.range(0, Math.PI * 2);
        const distance = rng.range(1, this.radius - 1);
        houseCol = Math.round(this.center.x + Math.cos(angle) * distance);
        houseRow = Math.round(this.center.y + Math.sin(angle) * distance);

        houseCol += houseCol % 2;
        houseRow += houseRow % 2;
      } while (
        houseCol < 0 ||
        houseRow < 0 ||
        this.houses.some(h => h.x === houseCol && h.y === houseRow) // Avoid duplicate positions
      );

      this.houses.push(new House(houseCol, houseRow));
    }
    return this.houses;
  }

  generateFarms(rng: SeededRandom): Farm[] {
    const farmCount = Math.ceil(this.houseCount / 3);
    for (let i = 0; i < farmCount; i++) {
      let farmCol: number;
      let farmRow: number;
      do {
        const angle = rng.range(0, Math.PI * 2);
        const distance = rng.range(1, this.radius - 1);
        farmCol = Math.round(this.center.x + Math.cos(angle) * distance);
        farmRow = Math.round(this.center.y + Math.sin(angle) * distance);
      } while (
        farmCol < 0 ||
        farmRow < 0 ||
        this.farms.some(f => f.x === farmCol && f.y === farmRow) // Avoid duplicate positions
      );

      // Create a 2x2 farm block
      for (let dx = 0; dx < 2; dx++) {
        for (let dy = 0; dy < 2; dy++) {
          this.farms.push(new Farm(farmCol + dx, farmRow + dy));
        }
      }
    }
    return this.farms;
  }

  generateVillagers(map: GameMap): Villager[] {
    const residents = this.population / this.houseCount
    this.houses.forEach(house => {
      while (house.residents.length < residents) {
        const villager = new Villager(house.x, house.y, map, house);
        house.residents.push(villager);
        this.villagers.push(villager);
      }
    });
    return this.villagers;
  }
}
