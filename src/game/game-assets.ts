import { emojiToPixelArt } from '@/core/emoji';
import { NewTileset as NewTileset } from '@/core/new-tileset';
import { createCornerImage } from '@/core/util/image-generator';
import { generateImageData } from './sprite-loader';
import { cat, grass, house, oak, obelisk, spruce, statue, villager } from './sprites';

export type CatStates = keyof typeof cat.data;
export type VillagerStates = keyof typeof villager.data;

const emoji = '🔥,🍀,🌼,🐓,🌷,🌹,👻,🥚,🍎'.split(',');
export const icons = emoji.map(e => emojiToPixelArt(e));

export class GameAssets {
  static cat: NewTileset<CatStates>;
  static villager: NewTileset<VillagerStates>;
  static cornerImage: HTMLImageElement;
  static oak: HTMLImageElement;
  static spruce: HTMLImageElement;
  static house: HTMLImageElement;
  static grass: HTMLImageElement;
  static statue: HTMLImageElement;
  static obelisk: HTMLImageElement;

  public static initialize() {
    GameAssets.cat = new NewTileset<CatStates>(cat);
    GameAssets.villager = new NewTileset<VillagerStates>(villager);
    GameAssets.cornerImage = createCornerImage();
    GameAssets.oak = generateImageData(oak.data, oak.palette);
    GameAssets.spruce = generateImageData(spruce.data, spruce.palette);
    GameAssets.house = generateImageData(house.data, house.palette);
    GameAssets.grass = generateImageData(grass.data, grass.palette);
    GameAssets.statue = generateImageData(statue.data, statue.palette);
    GameAssets.obelisk = generateImageData(obelisk.data, obelisk.palette);
  }
}
