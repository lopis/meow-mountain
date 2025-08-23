import { SeededRandom } from "@/core/util/rng";
import { Farm } from "./farm";
import { House } from "./house";
import { Tileset } from "@/core/tileset";
import { Asset } from "./game-assets";
import { Villager } from "./villager";

export class Village {
  houses: House[] = [];
  farms: Farm[] = [];
  villagers: Villager[] = [];

  constructor(
    public name: string,
    public center: { x: number; y: number },
    public radius: number,
    public houseCount: number,
  ) {
    this.center = center;
    this.radius = radius;
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
    const farmCount = Math.floor(rng.range(1, 4)); // Random number of farms per village
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

  generateVillagers(rng: SeededRandom): Villager[] {
    const villagerCount = Math.floor(rng.range(2, 6)); // Random number of villagers per village
    for (let i = 0; i < villagerCount; i++) {
      let villagerCol: number;
      let villagerRow: number;
      do {
        const angle = rng.range(0, Math.PI * 2);
        const distance = rng.range(1, this.radius - 1);
        villagerCol = Math.round(this.center.x + Math.cos(angle) * distance);
        villagerRow = Math.round(this.center.y + Math.sin(angle) * distance);
      } while (
        villagerCol < 0 ||
        villagerRow < 0 ||
        this.villagers.some(v => v.x === villagerCol && v.y === villagerRow) // Avoid duplicate positions
      );

      this.villagers.push(new Villager(villagerCol, villagerRow));
    }
    return this.villagers;
  }
}
