import { emojiToPixelArt } from "@/core/emoji";
import { Icon } from "./icon";
import { drawEngine } from "@/core/draw-engine";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";

type SpiritType = '👻' | '👹' | '🧿' | '🦀' | '🌵' | '🥨' | '🧚🏻‍♀️' | '💀';

interface SpiritSpecies {
  type: SpiritType,
  icon: HTMLImageElement,
  level: 1 | 2 | 3,
}

const icons: Record<SpiritType, SpiritSpecies> = {
  '🌵': {
    icon: emojiToPixelArt('🌵'),
    type: '🌵',
    level: 1,
  },
  '🥨': {
    icon: emojiToPixelArt('🥨'),
    type: '🥨',
    level: 1,
  },
  '🧚🏻‍♀️': {
    icon: emojiToPixelArt('🧚🏻‍♀️'),
    type: '🧚🏻‍♀️',
    level: 1,
  },
  '🦀': {
    icon: emojiToPixelArt('🦀'),
    type: '🦀',
    level: 2,
  },
  '👻': {
    icon: emojiToPixelArt('👻'),
    type: '👻',
    level: 2,
  },
  '👹': {
    icon: emojiToPixelArt('👹'),
    type: '👹',
    level: 3,
  },
  '🧿': {
    icon: emojiToPixelArt('🧿'),
    type: '🧿',
    level: 3,
  },
  '💀': {
    icon: emojiToPixelArt('💀'),
    type: '💀',
    level: 3,
  },
}

export class Spirit extends Icon {
  animationDuration = 2000;
  animationTime = 0;
  species: SpiritSpecies;

  constructor(
    col: number,
    row: number,
    type: SpiritType,
  ) {
    super(icons[type].icon, col, row, 'spirit');
    this.species = icons[type];
  }

  update(timeElapsed: number) {
    this.animationTime += timeElapsed * this.species.level;
    if (this.animationTime >= this.animationDuration) {
      this.animationTime -= this.animationDuration;
    }
  }

  draw() {
    const phase = Math.sin((this.animationTime / this.animationDuration) * 2 * Math.PI);

    // Shadow
    const shadow = Math.round(2 + 1 * phase) / 10
    drawEngine.ctx1.fillStyle = `rgba(0,0,0,${shadow})`;
    drawEngine.ctx1.fillRect(
      this.x + 3,
      this.y + CELL_HEIGHT * 3 / 4,
      this.icon.width - 6,
      CELL_HEIGHT / 4 + 1,
    )

    // Icon
    drawEngine.ctx1.save();
    drawEngine.ctx1.translate(
      0,
      Math.round(
        (phase - 1) * 2
      )
    )
    super.draw();
    drawEngine.ctx1.restore();
  }
}
