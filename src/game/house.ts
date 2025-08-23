import { GameObject } from "@/core/game-object";
import { AssetType, GameAssets } from "./game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "./constants";

export class House extends GameObject<AssetType> {
  constructor (col: number, row: number) {
    super(
      GameAssets.assets,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'house',
      'house',
    );
  }
}
