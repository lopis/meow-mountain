import { GameMap } from "./game-map";
import { Player } from "./entities/player";
import { statues } from "./constants";
import { colors } from "@/core/util/color";
import { on } from "@/core/event";
import { MAGIC, SCRATCH, TELEPORT } from "@/core/font";

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

    on('enable-scratch', () => {
      this.actions[0].enabled = true;
    });
  }

  // Update available actions based on player's current position
  update(): void {
    // Check if player is near a statue
    this.actions[2].enabled = this.ifFacingStatue();
  }

  private ifFacingStatue(): boolean {
    const cellInFront = this.map.getLookingAt();
    return (
      cellInFront.content?.type === 'statue'
      || cellInFront.content?.type === 'obelisk'
    ) && this.player.col != statues.heart.x;
  }
}
