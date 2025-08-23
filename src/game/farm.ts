import { GameObject } from "@/core/game-object";
import { CELL_WIDTH, CELL_HEIGHT } from "./game-map";
import { Tileset } from "@/core/tileset";
import { AssetType, GameAssets } from "./game-assets";

export class Farm extends GameObject<AssetType> {
  constructor(x: number, y: number, tileset: Tileset<AssetType>) {
    super(
      tileset,
      x,
      y,
      "field",
      "field"
    );
  }
}
