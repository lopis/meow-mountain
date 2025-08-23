import { emojiToPixelArt } from "@/core/emoji";
import { Tileset } from "@/core/tileset";

const catStates = ['sit', 'idle', 'walk', 'run', 'die', 'scratch', 'hop'];
export type CatStates = typeof catStates[number];

export type AssetType = 'spruce' | 'oak' | 'house' | 'field';
const assets: AssetType[] = ['spruce', 'oak', 'house', 'field'];
const emoji = '🔥,🍀,🌼,🐓,🌷,🌹,👻,🥚,🍎'.split(',');

export const icons = emoji.map(e => emojiToPixelArt(e));

export class GameAssets {
  public static cat: Tileset<CatStates>;
  public static assets: Tileset<AssetType>;

  public static initialize() {
    this.cat = new Tileset<CatStates>('/cat.png', 16, catStates);
    console.log(this.cat);
    
    this.assets = new Tileset<AssetType>('/assets.png', 16, assets);    
  }
}
