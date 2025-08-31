import { drawEngine } from "@/core/draw-engine";
import { Color, colors } from "@/core/util/color";
import { CELL_WIDTH } from "../constants";

const defaultColors: [Color, Color, Color, Color] = [colors.blue1, colors.blue2, colors.purple5, colors.purple4];

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
  const hpWidth = barWidth * hpRatio;
  const barX = x;
  const barY = y - 5;

  drawEngine.ctx1.fillStyle = colorHP[0];
  drawEngine.ctx1.fillRect(barX, barY, Math.round(hpWidth), barHeight);
  drawEngine.ctx1.fillStyle = colorHP[1];
  drawEngine.ctx1.fillRect(barX, barY + 1, Math.round(hpWidth), barHeight);

  drawEngine.ctx1.fillStyle = colorHP[2];
  drawEngine.ctx1.fillRect(barX + Math.round(hpWidth), barY, Math.round(barWidth - hpWidth), barHeight);
  drawEngine.ctx1.fillStyle = colorHP[3];
  drawEngine.ctx1.fillRect(barX + Math.round(hpWidth), barY + 1, Math.round(barWidth - hpWidth), barHeight);
};
