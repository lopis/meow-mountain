import { GameAssets } from '../game-assets';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';
import { GameStaticObject } from '@/core/game-static-object';

export class House extends GameStaticObject {
  name;

  constructor(col: number, row: number, name = '') {
    super(
      GameAssets.house,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'house',
    );
    this.name = name;
  }
}
