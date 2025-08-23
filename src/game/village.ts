export class Village {
  name: string;
  center: { x: number; y: number };
  radius: number;
  houses: { x: number; y: number }[];

  constructor(name: string, center: { x: number; y: number }, radius: number) {
    this.name = name;
    this.center = center;
    this.radius = radius;
    this.houses = [];
  }
}