import { GameObject } from "@/core/game-object";
import { Asset, GameAssets } from "./game-assets";

export class Statue extends GameObject<Asset> {
  constructor(
    public x: number,
    public y: number,
  ) {
    super(GameAssets.assets, x, y, 'statue', 'statue', 0);
  }
}
