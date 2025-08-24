import { GameObject } from "@/core/game-object";
import { Asset, GameAssets } from "../game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";

export class Statue extends GameObject<Asset> {
  constructor(col: number, row: number) {
    super(
      GameAssets.assets,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'statue',
      'statue'
    );
  }
}
