import { GameObject } from '@/core/game-object';
import { Asset, GameAssets } from '../game-assets';
import { CELL_HEIGHT, CELL_WIDTH, MAX_MAGIC, MAX_REPAIR } from '../constants';
import { GameMap } from '../game-map';
import { drawHpBar } from './hp-bar';
import { colors } from '@/core/util/color';
import { emit } from '@/core/event';

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

  attemptRepair() {
    const maxProgress = this.map.gameData.magic / MAX_MAGIC;
    const maxRepair = MAX_REPAIR * maxProgress;
    if (this.repair < maxRepair) {
      this.repair ++;
    } else {
      emit('not-enough-magic');
    }
  }
}
