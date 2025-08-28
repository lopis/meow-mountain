import { drawEngine } from "@/core/draw-engine";
import { on } from "@/core/event";
import { colors } from "@/core/util/color";

export class DialogBox {
  dialog: string | null = null;

  constructor() {
    on('story-dialog', (dialog) => {
      this.dialog = dialog;
    });

    on('story-state-exit', () => {
      this.dialog = null;
    });
  }

  draw () {
    if (this.dialog) {
      const boxHeight = 160; // same as minimap
      const margin = 10; // same as minimap
      const boxWidth = c3.width - boxHeight - margin*3;
      const x = margin;
      const y = c3.height - boxHeight - margin;
      drawEngine.ctx3.fillStyle = colors.purple0;
      drawEngine.ctx3.fillRect(x, y, boxWidth, boxHeight);

      drawEngine.drawText({
        text: this.dialog,
        x: x + margin,
        y: y + margin,
        color: colors.black,
        size: 4,
      }, drawEngine.ctx3);
    }
  }
}
