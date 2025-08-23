import { emojiToPixelArt } from "@/core/emoji";
import { Tileset } from "@/core/tileset";

const catStates = ['sit', 'idle', 'walk', 'run', 'die', 'scratch', 'hop'];
export type CatStates = typeof catStates[number];

const villagerStates = ['idle', 'walk', 'scared'];
export type VillagerStates = typeof villagerStates[number];

export type Asset = 'spruce' | 'oak' | 'house' | 'field';
const assets: Asset[] = ['spruce', 'oak', 'house', 'field'];
const emoji = '🔥,🍀,🌼,🐓,🌷,🌹,👻,🥚,🍎'.split(',');

export const icons = emoji.map(e => emojiToPixelArt(e));

export class GameAssets {
  public static cat: Tileset<CatStates>;
  public static villager: Tileset<VillagerStates>;
  public static assets: Tileset<Asset>;

  public static initialize() {
    this.cat = new Tileset<CatStates>('/cat.png', 16, catStates);
    this.assets = new Tileset<Asset>('/assets.png', 16, assets);
    this.villager = new Tileset<VillagerStates>('/villager.png', 16, villagerStates);
  }
}
