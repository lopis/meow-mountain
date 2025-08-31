import { GameObject } from "@/core/game-object";
import { Asset, GameAssets } from "../game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";
import { GameMap } from "../game-map";

export class Obelisk extends GameObject<Asset> {
  map: GameMap;
  name = 'barrier obelisk';
  
  constructor(map: GameMap) {
    const col = 69;
    const row = 88; 
    super(
      GameAssets.assets,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'obelisk',
      'obelisk',
    );
    this.map = map;
    this.map.set(this.col, this.row, this);
  }
}
