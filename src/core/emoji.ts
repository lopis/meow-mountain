/**
 * Quantizes rgba color values to 8bit.
 */
const quantizeToPalette = (r: number, g: number, b: number, a: number) => {
  // 1-bit transparency
  if (a < 128) {
    return [0, 0, 0, 0]; // transparent
  }
  const qr = Math.round(r / 51) * 51;
  const qg = Math.round(g / 51) * 51;
  const qb = Math.round(b / 51) * 51;

  return [qr, qg, qb, 255];
}

/**
 * Converts an emoji to a pixelated image by quantizing the colors
 * to 8 bit and the transparency to 1 bit.
 */
export const emojiToPixelArt = (
  emoji: string,
  fontSize = 10,
) => {
  // Some emoji are a bit bigger than the font
  const spriteScale = 0.25
  const spriteSize = Math.floor(fontSize * (1 + spriteScale));
  const padding = Math.floor(fontSize * spriteScale / 2);

  // Create temporary canvas
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = spriteSize;
  tmpCanvas.height = spriteSize;
  const tmpCtx = tmpCanvas.getContext("2d") as CanvasRenderingContext2D;

  // Draw emoji in chosen font size
  tmpCtx.font = `${fontSize}px sans-serif`;
  tmpCtx.textBaseline = "top";
  tmpCtx.clearRect(0, 0, spriteSize, spriteSize);
  tmpCtx.fillText(emoji, padding, padding);

  // Read pixels
  const imgData = tmpCtx.getImageData(0, 0, spriteSize, spriteSize);
  const data = imgData.data;

  // Create new image data with quantized colors
  const outImg = tmpCtx.createImageData(spriteSize, spriteSize);
  const outData = outImg.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = quantizeToPalette(
      data[i],      // red
      data[i + 1],  // green
      data[i + 2],  // blue
      data[i + 3],  // alpha
    );
    outData[i] = r;
    outData[i + 1] = g;
    outData[i + 2] = b;
    outData[i + 3] = a;
  }

  // Create a new canvas to draw the quantized image
  const outCanvas = document.createElement("canvas");
  outCanvas.width = spriteSize;
  outCanvas.height = spriteSize;
  const outCtx = outCanvas.getContext("2d") as CanvasRenderingContext2D;
  outCtx.putImageData(outImg, 0, 0);

  // Create an image element from the canvas
  const img = new Image();
  img.src = outCanvas.toDataURL();
  return img;
}


// const ctx = c.getContext("2d");
// ctx.imageSmoothingEnabled = false;


// const font = 8;
// const spriteSize = Math.floor(font * 1.25); // must match function logic

// const emojis = ['🔥','🍀','🌼','🐓','🌷','🌹','👻','🥚','🍎'];

// emojis.forEach((emoji, i) => {
//   const col = i % (100 / spriteSize);       // column in grid
//   const row = Math.floor(i / (100 / spriteSize)); // row in grid
//   const x = col * spriteSize;
//   const y = row * spriteSize;

//   emojiToPixelArt(emoji, ctx, font, x, y);
// });
