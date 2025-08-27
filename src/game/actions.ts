import { GameMap } from "./game-map";
import { Player } from "./entities/player";
import { controls } from "@/core/controls";
import { emit } from "@/core/event";
import { statues } from "./constants";

type Action = 'teleport' | 'scratch';

export class Actions {
  map: GameMap;
  player: Player;
  currentAction: Partial<Action> | null = null;

  constructor(map: GameMap, player: Player) {
    this.map = map;
    this.player = player;
  }

  // Update available actions based on player's current position
  update(): void {
    this.currentAction = null;

    // Check if player is near a statue
    if (this.ifFacingStatue()) {
      this.currentAction = 'teleport';
    }

    // Handle action key press
    if (controls.actionJustPressed && this.currentAction) {
      emit(this.currentAction);
    }
  }

  private ifFacingStatue(): boolean {
    const cellInFront = this.map.grid[this.player.row - 1][this.player.col];
    return cellInFront.content?.type === 'statue' && this.player.col != statues.heart.x;
  }
}
