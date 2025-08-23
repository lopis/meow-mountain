import { GameObject } from "@/core/game-object";
import { AssetType, GameAssets } from "./game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "./game-map";

export class House extends GameObject<AssetType> {
  constructor (x: number, y: number) {
    super(
      GameAssets.assets,
      x * CELL_WIDTH - (16 - CELL_WIDTH) / 2,
      y * CELL_HEIGHT,
      'house',
      'house',
    );
  }
}
