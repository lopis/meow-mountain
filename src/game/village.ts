import { SeededRandom } from "@/core/util/rng";
import { Farm } from "./farm";
import { House } from "./house";
import { Tileset } from "@/core/tileset";
import { AssetType } from "./game-assets";

export class Village {
  houses: { x: number; y: number }[];

  constructor(
    public name: string,
    public center: { x: number; y: number },
    public radius: number,
    public houseCount: number,
  ) {
    this.center = center;
    this.radius = radius;
    this.houses = [];
  }

  generateHouses(rng: SeededRandom, width: number, height: number): House[] {
    const houses: House[] = [];
    for (let i = 0; i < this.houseCount; i++) {
      let houseCol: number;
      let houseRow: number;
      do {
        const angle = rng.range(0, Math.PI * 2);
        const distance = rng.range(1, this.radius - 1);
        houseCol = Math.round(this.center.x + Math.cos(angle) * distance);
        houseRow = Math.round(this.center.y + Math.sin(angle) * distance);

        // Ensure houses are placed on even grid positions to avoid clustering
        houseCol += houseCol % 2;
        houseRow += houseRow % 2;
      } while (
        houseCol < 0 ||
        houseRow < 0 ||
        houseCol >= width ||
        houseRow >= height ||
        houses.some(h => h.x === houseCol && h.y === houseRow) // Avoid duplicate positions
      );

      houses.push(new House(houseCol, houseRow));
    }
    debugger;
    return houses;
  }

  generateFarms(rng: SeededRandom, width: number, height: number, tileset: Tileset<AssetType>): Farm[] {
    const farms: Farm[] = [];
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
        farmCol + 1 >= width ||
        farmRow + 1 >= height ||
        farms.some(f => f.x === farmCol && f.y === farmRow) // Avoid duplicate positions
      );

      // Create a 2x2 farm block
      for (let dx = 0; dx < 2; dx++) {
        for (let dy = 0; dy < 2; dy++) {
          farms.push(new Farm(farmCol + dx, farmRow + dy, tileset));
        }
      }
    }
    return farms;
  }
}
