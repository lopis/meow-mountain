import { emojiToPixelArt } from "@/core/emoji";
import { Icon } from "./icon";
import { drawEngine } from "@/core/draw-engine";
import { CELL_HEIGHT, CELL_WIDTH } from "../constants";
import { colors } from "@/core/util/color";

type SpiritType = '👻' | '👹' | '🧿' | '🦀' | '🌵' | '🥨' | '🧚🏻‍♀️' | '💀';

const icons: Record<SpiritType, HTMLImageElement> = {
  '👻': emojiToPixelArt('👻'),
  '👹': emojiToPixelArt('👹'),
  '🧿': emojiToPixelArt('🧿'),
  '🦀': emojiToPixelArt('🦀'),
  '🌵': emojiToPixelArt('🌵'),
  '🥨': emojiToPixelArt('🥨'),
  '🧚🏻‍♀️': emojiToPixelArt('🧚🏻‍♀️'),
  '💀': emojiToPixelArt('💀'),
}

export class Spirit extends Icon {
  animationDuration = 2000;
  animationTime = 0;

  constructor(
    col: number,
    row: number,
    type: SpiritType,
  ) {
    super(icons[type], col, row, 'spirit');
  }

  update(timeElapsed: number) {
    this.animationTime += timeElapsed;
    if (this.animationTime >= this.animationDuration) {
      this.animationTime -= this.animationDuration;
    }
  }

  draw() {
    const phase = Math.sin((this.animationTime / this.animationDuration) * 2 * Math.PI);


    // Shadow
    const shadow = Math.round(2 + 2 * phase) / 10
    drawEngine.ctx2.fillStyle = `rgba(0,0,0,${shadow})`;
    drawEngine.ctx2.fillRect(
      this.x + 2,
      this.y + CELL_HEIGHT * 3 / 4,
      this.icon.width - 4,
      CELL_HEIGHT / 4,
    )

    // Icon
    drawEngine.ctx2.save();
    drawEngine.ctx2.translate(
      0,
      Math.round(
        (phase - 1) * 2
      )
    )
    super.draw();
    drawEngine.ctx2.restore();
  }
}
