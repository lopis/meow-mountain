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

      this.dialog.split('\n').forEach((dialog, i) => {
        drawEngine.drawText({
          text: dialog,
          x: x + margin * 2,
          y: y + margin * 2 + i * 40,
          color: colors.black,
          size: 5,
        }, drawEngine.ctx3);
      });

      drawEngine.drawText({
          text: 'press (space) to continue',
          x: x + boxWidth - margin,
          y: y + boxHeight - margin,
          color: colors.purple4,
          size: 5,
          textAlign: 'right',
          textBaseline: 'bottom',
        }, drawEngine.ctx3);
    }
  }
}
