import { GameAssets } from '../game-assets';
import { CELL_HEIGHT, CELL_WIDTH, MAX_MAGIC, MAX_REPAIR } from '../constants';
import { GameMap } from '../game-map';
import { drawHpBar } from './hp-bar';
import { colors } from '@/core/util/color';
import { emit } from '@/core/event';
import { GameEvent } from '../event-manifest';
import { GameStaticObject } from '@/core/game-static-object';
import { meow } from '@/core/audio';

export class Obelisk extends GameStaticObject {
  map: GameMap;
  name = 'barrier obelisk';
  repair = 0;
  
  constructor(map: GameMap) {
    const col = 69;
    const row = 88; 
    super(
      GameAssets.obelisk,
      col * CELL_WIDTH,
      row * CELL_HEIGHT,
      'obelisk',
    );
    this.map = map;
    this.map.set(this.col, this.row, this);
  }

  draw() {
    super.draw();
    if (this.repair > 0) {
      drawHpBar(this.repair, MAX_REPAIR, this.x, this.y, [colors.yellow1, colors.yellow2, colors.blue5, colors.blue6]);
    }
  }

  attemptRepair() {
    const maxProgress = this.map.gameData.magic / MAX_MAGIC;
    const maxRepair = MAX_REPAIR * maxProgress;
    if (this.repair < maxRepair) {
      this.repair ++;
      meow(2 * this.repair - 10);
    } else {
      meow(-10);
      emit(GameEvent.NOT_ENOUGH_MAGIC);
    }
  }
}
