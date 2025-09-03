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

type ActionType = 'teleport' | 'scratch' | 'restore';
type Action = {
  type: ActionType,
  color: string,
  enabled: boolean,
  symbol: string,
}

export class Actions {
  map: GameMap;
  player: Player;
  actions: Action[] = [
    {
      type: 'scratch',
      color: colors.purple4,
      enabled: false,
      symbol: SCRATCH,
    },
    {
      type: 'teleport',
      color: colors.blue2,
      enabled: false,
      symbol: TELEPORT,
    },
    {
      type: 'restore',
      color: colors.green1,
      enabled: false,
      symbol: MAGIC,
    },
  ];

  constructor(map: GameMap, player: Player) {
    this.map = map;
    this.player = player;

    on(GameEvent.ENABLE_SCRATCH, () => {
      this.actions[0].enabled = true;
    });
  }

  // Update available actions based on player's current position
  update(): void {
    // Check if player is near a statue
    this.actions[2].enabled = this.canRestore();
    this.actions[1].enabled = this.canTeleport();

    if (controls.isAction2 && !controls.previousState.isAction2) {
      emit(GameEvent.TELEPORT);
    }

    if (controls.isAction3 && !controls.previousState.isAction3) {
      emit(GameEvent.RESTORE);
      const cellInFront = this.map.getLookingAt();
      const object = cellInFront.content as Statue | Obelisk;
      if (object.repair < MAX_REPAIR) {
        if (object instanceof Statue) {
          object.repair++;
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
  }

  private canRestore(): boolean {
    const cellInFront = this.map.getLookingAt();
    const object = cellInFront.content as Statue | Obelisk;
    const type = object?.type;
    return (
      (type === 'statue' || type === 'obelisk')
    ) && object.repair < MAX_REPAIR;
  }

  private canTeleport() {
    const cellInFront = this.map.getLookingAt();
    return cellInFront.content?.type === 'statue'
      && this.player.col != statues.heart.x;
  }
}
