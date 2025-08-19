import { Tileset } from "@/core/tileset";

const catStates = ['idle', 'walk', 'run'];
export type Cat = typeof catStates[number];

export class GameAssets {
  public static cat: Tileset<Cat>;

  public static initialize() {
    // Initialize the tileset with a spritesheet path and tile width
    this.cat = new Tileset<Cat>('/cat.png', 16, catStates);
    console.log(this.cat);
  }
}
