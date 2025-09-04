import { GameAssets } from '../game-assets';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';
import { Villager } from './villager';
import { GameStaticObject } from '@/core/game-static-object';

export class House extends GameStaticObject {
  residents: Villager[] = [];

  constructor(col: number, row: number) {
    super(
      GameAssets.house,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'house',
    );
  }
}
