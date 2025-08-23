import { GameObject } from "@/core/game-object";
import { Tileset } from "@/core/tileset";
import { AssetType, GameAssets } from "./game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "./constants";

export class Farm extends GameObject<AssetType> {
  constructor(col: number, row: number) {
    super(
      GameAssets.assets,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      "field",
      "field"
    );
  }
}
