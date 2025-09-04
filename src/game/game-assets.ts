import { emojiToPixelArt } from '@/core/emoji';
import { Tileset } from '@/core/tileset';
import { Tileset as NewTileset } from '@/core/new-tileset';
import { createCornerImage } from '@/core/util/image-generator';
import { encryptedIcons } from './sprites';

const catStates = ['idle', 'walk', 'run', 'die', 'scratch', 'scared', 'sleep'] as const;
export type CatStates = typeof catStates[number];

const villagerStates = ['walk', 'idle', 'scared'] as const;
export type VillagerStates = typeof villagerStates[number];

const assets = ['spruce', 'oak', 'house', 'field', 'statue', 'obelisk'];
export type Asset = typeof assets[number];
const emoji = '🔥,🍀,🌼,🐓,🌷,🌹,👻,🥚,🍎'.split(',');

export const icons = emoji.map(e => emojiToPixelArt(e));

export class GameAssets {
  public static cat: NewTileset<CatStates>;
  public static villager: NewTileset<VillagerStates>;
  public static assets: Tileset<Asset>;
  public static cornerImage: HTMLImageElement;

  public static initialize() {
    this.cat = new NewTileset<CatStates>(encryptedIcons.cat);
    this.assets = new Tileset<Asset>('assets.png', 16, assets);
    this.villager = new NewTileset<VillagerStates>(encryptedIcons.villager);
    this.cornerImage = createCornerImage();
  }
}
