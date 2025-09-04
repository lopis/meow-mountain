import { GameAssets } from '../game-assets';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';
import { GameStaticObject } from '@/core/game-static-object';

export class House extends GameStaticObject {
  constructor(col: number, row: number) {
    super(
      GameAssets.house,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'house',
    );
  }
}
