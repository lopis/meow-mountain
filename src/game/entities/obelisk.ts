import { GameObject } from "@/core/game-object";
import { Asset, GameAssets } from "../game-assets";
import { CELL_HEIGHT, CELL_WIDTH, MAX_REPAIR } from "../constants";
import { GameMap } from "../game-map";
import { drawHpBar } from "./hp-bar";
import { colors } from "@/core/util/color";

export class Obelisk extends GameObject<Asset> {
  map: GameMap;
  name = 'barrier obelisk';
  repair = 0;
  
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

  draw() {
    super.draw();
    if (this.repair > 0) {
      drawHpBar(this.repair, MAX_REPAIR, this.x, this.y, [colors.yellow1, colors.yellow2, colors.blue4, colors.blue5]);
    }
  }
}
