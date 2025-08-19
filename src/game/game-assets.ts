import { Tileset } from "@/core/tileset";

const catStates = ['sit', 'idle', 'walk', 'run'];
export type CatStates = typeof catStates[number];

const assets = ['spruce', 'oak', 'house'];
export type AssetType = typeof assets[number];

export class GameAssets {
  public static cat: Tileset<CatStates>;
  public static assets: Tileset<AssetType>;

  public static initialize() {
    this.cat = new Tileset<CatStates>('/cat.png', 16, catStates);
    this.assets = new Tileset<AssetType>('/assets.png', 16, assets);    
  }
}
