import { Tileset } from "@/core/tileset";

const catStates = ['idle', 'walk', 'run'];

export class GameAssets {
  public static cat: Tileset<typeof catStates[number]>;

  public static initialize() {
    // Initialize the tileset with a spritesheet path and tile width
    this.cat = new Tileset<typeof catStates[number]>('/cat.png', 16, catStates);
    console.log(this.cat);
  }
}
