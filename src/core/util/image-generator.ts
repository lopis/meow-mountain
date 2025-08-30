import { colors } from "./color";

/**
 * Creates a 16x16 image with transparent background and colored corners
 * @param cornerColor The color to use for the 3x3 corner pixels
 * @returns HTMLImageElement ready to be used with drawImage
 */
export function createCornerImage(cornerColor: string = colors.purple4): HTMLImageElement {
  // Create temporary canvas
  const canvas = document.createElement("canvas");
  // eslint-disable-next-line id-denylist
  canvas.width = 16;
  // eslint-disable-next-line id-denylist
  canvas.height = 16;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  // Clear to transparent
  ctx.clearRect(0, 0, 16, 16);

  // Set corner color
  ctx.fillStyle = cornerColor;

  // Draw 2x2 arrow corners (3 pixels each, 1 transparent)
  
  // Top-left corner arrow (pointing inward)
  ctx.fillRect(0, 0, 1, 1); // top-left pixel
  ctx.fillRect(1, 0, 1, 1); // top-right pixel  
  ctx.fillRect(0, 1, 1, 1); // bottom-left pixel
  // (1,1) is transparent
  
  // Top-right corner arrow (pointing inward)
  ctx.fillRect(14, 0, 1, 1); // top-left pixel
  ctx.fillRect(15, 0, 1, 1); // top-right pixel
  ctx.fillRect(15, 1, 1, 1); // bottom-right pixel
  // (14,1) is transparent
  
  // Bottom-left corner arrow (pointing inward)
  ctx.fillRect(0, 14, 1, 1); // top-left pixel
  ctx.fillRect(0, 15, 1, 1); // bottom-left pixel
  ctx.fillRect(1, 15, 1, 1); // bottom-right pixel
  // (1,14) is transparent
  
  // Bottom-right corner arrow (pointing inward)
  ctx.fillRect(15, 14, 1, 1); // top-right pixel
  ctx.fillRect(14, 15, 1, 1); // bottom-left pixel
  ctx.fillRect(15, 15, 1, 1); // bottom-right pixel
  // (14,14) is transparent

  // Convert canvas to image
  const img = new Image();
  img.src = canvas.toDataURL();
  
  return img;
}
