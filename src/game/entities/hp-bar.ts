import { drawEngine } from "@/core/draw-engine";
import { colors } from "@/core/util/color";
import { CELL_WIDTH } from "../constants";

const defaultColors: [string, string, string, string] = [colors.blue1, colors.blue2, colors.purple5, colors.purple4];

export const drawHpBar = (
  hp: number,
  maxHp: number,
  x: number,
  y: number,
  colorHP = defaultColors,
) => {
  const hpRatio = Math.max(0, Math.min(1, hp / maxHp));
  const barWidth = CELL_WIDTH;
  const barHeight = 1;
  const hpWidth = Math.floor(barWidth * hpRatio);
  const barX = x;
  const barY = y - 5;

  drawEngine.ctx1.fillStyle = colorHP[0];
  drawEngine.ctx1.fillRect(barX, barY, hpWidth, barHeight);
  drawEngine.ctx1.fillStyle = colorHP[1];
  drawEngine.ctx1.fillRect(barX, barY + 1, hpWidth, barHeight);

  drawEngine.ctx1.fillStyle = colorHP[2];
  drawEngine.ctx1.fillRect(
    barX + hpWidth,
    barY,
    barWidth - hpWidth,
    barHeight,
  );
  drawEngine.ctx1.fillStyle = colorHP[3];
  drawEngine.ctx1.fillRect(
    barX + hpWidth,
    barY +
    1,
    barWidth - hpWidth, barHeight,
  );
};
