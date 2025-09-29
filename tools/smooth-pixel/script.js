/* eslint-disable id-denylist */
const spriteBase64 = image.src;

function colorsEqual(r1, g1, b1, a1, r2, g2, b2, a2) {
  if (a1 < 128 && a2 < 128) return true; // both transparent
  if (a1 < 128 || a2 < 128) return false; // one transparent
  return r1 === r2 && g1 === g2 && b1 === b2;
}

function getPixelColor(srcData, w, x, y) {
  if (x < 0 || y < 0 || x >= w || y >= srcData.height) return [0, 0, 0, 0];
  const idx = (y * w + x) * 4;
  return [
    srcData.data[idx],
    srcData.data[idx + 1],
    srcData.data[idx + 2],
    srcData.data[idx + 3],
  ];
}

function drawPixel(ctx, x, y, size, color, round, bridge) {
  const r = size / 2;
  ctx.fillStyle = color;

  ctx.beginPath();

  // Start at top-left
  ctx.moveTo(x, y);

  // Top edge
  ctx.lineTo(x + size, y);

  // Top-right corner
  if (bridge.tr) {
    ctx.lineTo(x + size - r, y);
    ctx.lineTo(x + size, y + r);
  } else if (round.tr) {
    ctx.lineTo(x + size, y);
    ctx.arc(x + size - r, y + r, r, -Math.PI/2, 0, false);
  } else {
    ctx.lineTo(x + size, y);
  }

  // Right edge
  ctx.lineTo(x + size, y + size);

  // Bottom-right corner
  if (bridge.br) {
    ctx.lineTo(x + size, y + size - r);
    ctx.lineTo(x + size - r, y + size);
  } else if (round.br) {
    ctx.arc(x + size - r, y + size - r, r, 0, Math.PI/2, false);
  } else {
    ctx.lineTo(x + size, y + size);
  }

  // Bottom edge
  ctx.lineTo(x, y + size);

  // Bottom-left corner
  if (bridge.bl) {
    ctx.lineTo(x + r, y + size);
    ctx.lineTo(x, y + size - r);
  } else if (round.bl) {
    ctx.arc(x + r, y + size - r, r, Math.PI/2, Math.PI, false);
  } else {
    ctx.lineTo(x, y + size);
  }

  // Left edge
  ctx.lineTo(x, y);

  // Top-left corner
  if (bridge.tl) {
    ctx.lineTo(x, y + r);
    ctx.lineTo(x + r, y);
  } else if (round.tl) {
    ctx.arc(x + r, y + r, r, Math.PI, 1.5 * Math.PI, false);
  } else {
    ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fill();
}

const img = new Image();
img.src = spriteBase64;
img.onload = () => {
  const ctx1 = canvas1.getContext('2d');
  const ctx2 = canvas2.getContext('2d');

  ctx1.imageSmoothingEnabled = false;
  ctx1.drawImage(img, 0, 0, 16, 16);
  const srcData = ctx1.getImageData(0, 0, 16, 16);

  const w = 16, h = 16;
  const size = 40;
  canvas2.width = w * size;
  canvas2.height = h * size;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = getPixelColor(srcData, w, x, y);
      const isTransparent = a < 0;
      const color = a < 128 ? 'white' : `rgb(${r},${g},${b})`;

      const up    = getPixelColor(srcData, w, x, y - 1);
      const down  = getPixelColor(srcData, w, x, y + 1);
      const left  = getPixelColor(srcData, w, x - 1, y);
      const right = getPixelColor(srcData, w, x + 1, y);

      const upLeft     = getPixelColor(srcData, w, x - 1, y - 1);
      const upRight    = getPixelColor(srcData, w, x + 1, y - 1);
      const downLeft   = getPixelColor(srcData, w, x - 1, y + 1);
      const downRight  = getPixelColor(srcData, w, x + 1, y + 1);

      const sameUp    = colorsEqual(r, g, b, a, ...up);
      const sameDown  = colorsEqual(r, g, b, a, ...down);
      const sameLeft  = colorsEqual(r, g, b, a, ...left);
      const sameRight = colorsEqual(r, g, b, a, ...right);

      const sameUpLeft    = !colorsEqual(...up, ...upLeft) && !colorsEqual(...left, ...upLeft);
      const sameUpRight   = !colorsEqual(...up, ...upRight) && !colorsEqual(...right, ...upRight);
      const sameDownLeft  = !colorsEqual(...down, ...downLeft) && !colorsEqual(...left, ...downLeft);
      const sameDownRight = !colorsEqual(...down, ...downRight) && !colorsEqual(...right, ...downRight);

      const round = {
        tl: !sameUp && !sameLeft,
        tr: !sameUp && !sameRight,
        br: !sameDown && !sameRight,
        bl: !sameDown && !sameLeft
      };

      const bridge = {
        tl: !sameUp && !sameLeft && sameUpLeft,
        tr: !sameUp && !sameRight && sameUpRight,
        br: !sameDown && !sameRight && sameDownRight,
        bl: !sameDown && !sameLeft && sameDownLeft,
      };

      // Fill rounded corners with neighbor color BEFORE drawing the main pixel
      const halfSize = size / 2;
      const corners = [
        { key: 'tl', qx: x * size, qy: y * size, diagonal: upLeft, side1: up, side2: left },
        { key: 'tr', qx: x * size + halfSize, qy: y * size, diagonal: upRight, side1: up, side2: right },
        { key: 'br', qx: x * size + halfSize, qy: y * size + halfSize, diagonal: downRight, side1: down, side2: right },
        { key: 'bl', qx: x * size, qy: y * size + halfSize, diagonal: downLeft, side1: down, side2: left },
      ];
      for (const c of corners) {
        if (round[c.key]) {
          // Check if both side neighbors have the same color
          const [s1r, s1g, s1b, s1a] = c.side1;
          const [s2r, s2g, s2b, s2a] = c.side2;
          const sidesMatch = colorsEqual(s1r, s1g, s1b, s1a, s2r, s2g, s2b, s2a);
          
          let fillColor;
          if (sidesMatch && s1a >= 128) {
            // Both sides same color, use that color
            fillColor = `rgb(${s1r},${s1g},${s1b})`;
          } else {
            // Use diagonal neighbor color
            const [dr, dg, db, da] = c.diagonal;
            if (da >= 128) {
              fillColor = `rgb(${dr},${dg},${db})`;
            }
          }
          
          if (fillColor) {
            ctx2.fillStyle = fillColor;
            ctx2.fillRect(c.qx, c.qy, halfSize, halfSize);
          }
        }
      }

      // Draw the main pixel on top (only if not transparent)
      if (!isTransparent) {
        drawPixel(ctx2, x * size, y * size, size, color, round, bridge);
      } else {
        // For transparent pixels, clip the background squares with rounded corners
        ctx2.save();
        ctx2.beginPath();
        
        // Create a clipping path that is the inverse of the rounded pixel
        // First, clip to the full pixel area
        ctx2.rect(x * size, y * size, size, size);
        
        // Then subtract the rounded pixel shape by using composite operation
        ctx2.clip();
        
        // Create the rounded pixel path to subtract
        const radius = size / 2;
        ctx2.globalCompositeOperation = 'destination-out';
        ctx2.beginPath();
        ctx2.moveTo(x * size, y * size);
        ctx2.lineTo(x * size + size, y * size);
        
        if (round.tr) {
          ctx2.arc(x * size + size - radius, y * size + radius, radius, -Math.PI/2, 0, false);
        }
        ctx2.lineTo(x * size + size, y * size + size);
        
        if (round.br) {
          ctx2.arc(x * size + size - radius, y * size + size - radius, radius, 0, Math.PI/2, false);
        }
        ctx2.lineTo(x * size, y * size + size);
        
        if (round.bl) {
          ctx2.arc(x * size + radius, y * size + size - radius, radius, Math.PI/2, Math.PI, false);
        }
        ctx2.lineTo(x * size, y * size);
        
        if (round.tl) {
          ctx2.arc(x * size + radius, y * size + radius, radius, Math.PI, 1.5 * Math.PI, false);
        }
        
        ctx2.closePath();
        ctx2.fill();
        
        ctx2.restore();
      }

      // DEBUG - to see the pixels better
      // ctx2.strokeStyle = '#FF000055';
      // ctx2.strokeRect(x * size, y * size, size, size);
    }
  }
};
