import { CELL_HEIGHT, CELL_WIDTH } from '../constants';
import { GameStaticObject } from '@/core/game-static-object';
import { GameAssets } from '../game-assets';

export class Farm extends GameStaticObject {
  constructor(col: number, row: number) {
    super(
      GameAssets.grass,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'field',
    );
  }
}
