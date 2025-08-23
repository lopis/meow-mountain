import { SeededRandom } from "@/core/util/rng";

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

  generateHouses(rng: SeededRandom, width: number, height: number): { x: number; y: number }[] {
    const houses: { x: number; y: number }[] = [];
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

      houses.push({ x: houseCol, y: houseRow });
    }
    return houses;
  }
}
