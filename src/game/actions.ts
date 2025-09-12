import { GameMap } from './game-map';
import { Player } from './entities/player';
import { MAX_REPAIR, statues } from './constants';
import { colors } from '@/core/util/color';
import { emit, on } from '@/core/event';
import { MAGIC, SCRATCH, TELEPORT } from '@/core/font';
import { controls } from '@/core/controls';
import { Statue } from './entities/statue';
import { Obelisk } from './entities/obelisk';
import { addTimeEvent } from '@/core/timer';
import { GameEvent } from './event-manifest';
import { meow } from '@/core/audio';
import { Cell } from './types';
import { Spirit } from './entities/spirit';
import { Farm } from './entities/farm';

type ActionType = 'teleport' | 'scratch' | 'repair' | 'sleep';
type Action = {
  type: ActionType,
  color: string,
  enabled: boolean,
  symbol: string,
}

const actions: Action[] = [
  {
    type: 'scratch',
    color: colors.purple4,
    enabled: false,
    symbol: SCRATCH,
  },
  {
    type: 'teleport',
    color: colors.blue2,
    enabled: true,
    symbol: TELEPORT,
  },
  {
    type: 'repair',
    color: colors.green1,
    enabled: true,
    symbol: MAGIC,
  },
  {
    type: 'sleep',
    color: colors.yellow2,
    enabled: true,
    symbol: 'z',
  },
];

export class Actions {
  map: GameMap;
  player: Player;
  actions: Action[] = [];

  constructor(map: GameMap, player: Player) {
    this.map = map;
    this.player = player;

    on(GameEvent.ENABLE_SCRATCH, () => {
      this.actions[0].enabled = true;
    });
  }

  // Update available actions based on player's current position
  update(): void {
    const cellInFront = this.map.getLookingAt();

    const canTeleport  = this.canTeleport(cellInFront);
    const canRestore = this.canRestore(cellInFront);
    const canSleep = this.canSleep(cellInFront);
    const canAttack = this.canAttack(cellInFront);

    this.actions = [
      canAttack ? actions[0]
      : canTeleport ? actions[1]
      : canRestore ? actions[2]
      : canSleep ? actions[3]
      : actions[0]
    ];

    if (controls.isAction1 && !controls.previousState.isAction1) {
      switch (true) {
        case canAttack:
          // Attack happens somewhere else
          break;
        
        case canTeleport:
          emit(GameEvent.TELEPORT);
          break;
        
        case canRestore:
          this.doRestore(cellInFront);
          break;

        case canSleep:
          emit(GameEvent.SLEEP);

      
        default:
          break;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  doRestore(cellInFront: Cell) {
    emit(GameEvent.RESTORE);
    const object = cellInFront.content as Statue | Obelisk;
    if (object.repair < MAX_REPAIR) {
      if (object instanceof Statue) {
        object.repair++;
        meow(object.repair);
        if (object.repair >= MAX_REPAIR) {
          addTimeEvent(() => {
            emit(GameEvent.STATUE_RESTORED);
          }, 4000);
        }
      } else if (object instanceof Obelisk) {
        object.attemptRepair();
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private canRestore(cellInFront: Cell): boolean {
    const object = cellInFront.content as Statue | Obelisk;
    const type = object?.type;
    return (
      (type === 'statue' || type === 'obelisk')
    ) && object.repair < MAX_REPAIR;
  }

  private canTeleport(cellInFront: Cell) {
    return cellInFront.content instanceof Statue
      && this.player.col != statues.heart.x
      && cellInFront.content.state === Statue.State.REPAIRED;
  }

  private canSleep(cellInFront: Cell) {
    return cellInFront.content == this.map.villages[0].houses[0];
  }

  private canAttack(cellInFront: Cell) {
    return cellInFront.content instanceof Spirit
      || cellInFront.content instanceof Farm;
  }
}
