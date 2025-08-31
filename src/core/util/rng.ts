// Seeded "random" number generator for deterministic randomness
export class SeededRandom {
  constructor(private rngSeed: number = 45) {}
  
  next(): number {
    this.rngSeed = (this.rngSeed * 9301 + 49297) % 233280;
    return this.rngSeed / 233280;
  }
  
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}
