import { Tileset } from "@/core/tileset";

export type CatStates = 'site' | 'idle' | 'walk' | 'run';
const catStates = ['sit', 'idle', 'walk', 'run'] as CatStates[];

export class GameAssets {
  public static cat: Tileset<CatStates>;

  public static initialize() {
    // Initialize the tileset with a spritesheet path and tile width
    this.cat = new Tileset<CatStates>('/cat.png', 16, catStates);
    console.log(this.cat);
  }
}
