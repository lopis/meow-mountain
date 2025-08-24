import { GameObject } from "@/core/game-object";
import { GameAssets, VillagerStates } from "./game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "./constants";
import { GameMap } from "./game-map";
import { findNearestMatch, Position } from "@/core/util/path-findind";
import { House } from "./house";

export class Villager extends GameObject<VillagerStates> {
  map: GameMap;
  home: House | null = null;

  constructor(col: number, row: number, map: GameMap) {
    super(
      GameAssets.villager,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'villager',
      'idle',
    );
    this.map = map;
  }

  findNearestHouse(): Position | null {
    const maxSearchDistance = 30; // Maximum steps to search for a house

    const housePosition = findNearestMatch(
      this.map.map,
      { x: this.col, y: this.row },
      (cell) => {
        // Check if the cell contains a house; multiple villagers can live in one house.
        return cell?.content?.type === 'house';
      },
      maxSearchDistance
    );

    if (housePosition) {
      this.home = this.map.map[housePosition.y][housePosition.x].content as House;
      this.home.residents.push(this);
    }

    return housePosition;
  }
}
