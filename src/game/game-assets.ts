import { emojiToPixelArt } from '@/core/emoji';
import { NewTileset as NewTileset } from '@/core/new-tileset';
import { createCornerImage } from '@/core/util/image-generator';
import { encryptedIcons } from './sprites';
import { generateImageData } from './sprite-loader';

export type CatStates = keyof typeof encryptedIcons.cat.data;
export type VillagerStates = keyof typeof encryptedIcons.villager.data;

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
    this.cat = new NewTileset<CatStates>(encryptedIcons.cat);
    this.villager = new NewTileset<VillagerStates>(encryptedIcons.villager);
    this.cornerImage = createCornerImage();
    this.oak = generateImageData(encryptedIcons.oak.data, encryptedIcons.oak.palette);
    this.spruce = generateImageData(encryptedIcons.spruce.data, encryptedIcons.spruce.palette);
    this.house = generateImageData(encryptedIcons.house.data, encryptedIcons.house.palette);
    this.grass = generateImageData(encryptedIcons.grass.data, encryptedIcons.grass.palette);
    this.statue = generateImageData(encryptedIcons.statue.data, encryptedIcons.statue.palette);
    this.obelisk = generateImageData(encryptedIcons.obelisk.data, encryptedIcons.obelisk.palette);
  }
}
