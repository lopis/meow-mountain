import { drawEngine } from '@/core/draw-engine';
import { on } from '@/core/event';
import { StoryEngineEvent } from '@/core/story-engine';
import { colors } from '@/core/util/color';

export class DialogBox {
  dialog: string | null = null;

  constructor() {
    on(StoryEngineEvent.STORY_DIALOG, (dialog) => {
      this.dialog = dialog;
    });

    on(StoryEngineEvent.STORY_STATE_EXIT, () => {
      this.dialog = null;
    });
  }

  draw () {
    if (this.dialog) {
      const boxHeight = 160; // same as minimap
      const margin = 20; // same as minimap
      const boxWidth = c3.width - boxHeight - margin*3;
      const x = margin;
      const y = c3.height - boxHeight - margin;
      drawEngine.ctx3.fillStyle = colors.purple4;
      drawEngine.ctx3.fillRect(x+5, y+5, boxWidth, boxHeight);
      drawEngine.ctx3.fillStyle = colors.purple0;
      drawEngine.ctx3.fillRect(x, y, boxWidth-5, boxHeight-5);

      this.dialog.split('\n').forEach((dialog, i) => {
        drawEngine.drawText(
          dialog,
          x + margin * 2,
          y + margin * 2 + i * 40,
          dialog[0] === '>' ? colors.purple4 : colors.black,
          0, // left
          0, // top
          5,
          1,
          drawEngine.ctx3
        );
      });

      drawEngine.drawText(
          'press (space) to continue',
          x + boxWidth - margin,
          y + boxHeight - margin,
          colors.purple4,
          2, // right
          2, // bottom
          3,
          1,
          drawEngine.ctx3
        );
    }
  }
}
