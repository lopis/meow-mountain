import { GameObject } from "@/core/game-object";
import { GameAssets, VillagerStates } from "./game-assets";
import { CELL_HEIGHT, CELL_WIDTH } from "./constants";

export class Villager extends GameObject<VillagerStates> {
  constructor(col: number, row: number) {
    super(
      GameAssets.villager,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'villager',
      'idle',
    );
  }
}
