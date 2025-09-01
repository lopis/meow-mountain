import { GameObject } from '@/core/game-object';
import { Asset, GameAssets } from '../game-assets';
import { CELL_HEIGHT, CELL_WIDTH } from '../constants';
import { Villager } from './villager';

export class House extends GameObject<Asset> {
  residents: Villager[] = [];

  constructor(col: number, row: number) {
    super(
      GameAssets.assets,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'house',
      'house',
    );
  }
}
