import { hexToRgb, colors } from "@/core/util/color";

export const tinyFont = /* font-start */'6v7ic,6trd0,6nvid,,55eyo,2np50,2jcjo,3ugt8,34ao,7k,b28,1,opzc,3xdeu,3sapz,8rhfz,8ri26,1bzky,9j1ny,3ws2u,9dv9k,3xb1i,3xbmu,2t8g,2t8s,26ndv,ajmo,fl5ug,3x7nm,n75t,54br,59u0e,53if,rlev,4jrb,1yjk4,53l2,55q95,18zsz,mi3r,574tl,1aedd,ljn9,a1bd,4f1i,a1fs,549t,53ig,5832,1dwsh,6iw6,6ix0,cbsa,6gix,6fk4,aky7,2jupw,cvtyq,2sc04,'/* font-end */.split(',');

const bitmaps: { [key: string]: ImageBitmap } = {};

export const HEART = '#';
export const HALF_HEART = '$';
export const BROKEN_HEART = '%';

export const TELEPORT = '[';
export const SCRATCH = '\\';
export const MAGIC = ']';

export type DrawTextProps = {
  text: string
  x: number
  y: number
  color?: string
  textAlign?: CanvasTextAlign
  textBaseline?: CanvasTextBaseline
  size?: number
  space?: number
}

const getCharacterData = (letter: string) => {
  if (letter === '0') return { paddedBinary: '0'.repeat(25), leftmostCol: 0, charWidth: 5 };
  
  const paddedBinary = String(parseInt(letter, 36).toString(2)).padStart(25, '0');
  let leftmostCol = 5;
  let rightmostCol = -1;
  
  // Find leftmost and rightmost columns with set bits
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 5; row++) {
      const bitIndex = row * 5 + col;
      if (paddedBinary[bitIndex] === '1') {
        leftmostCol = Math.min(leftmostCol, col);
        rightmostCol = Math.max(rightmostCol, col);
      }
    }
  }
  
  const charWidth = rightmostCol >= leftmostCol ? rightmostCol - leftmostCol + 1 : 1;
  return { paddedBinary, leftmostCol, charWidth };
};

const getCharacterWidth = (letter: string): number => {
  return getCharacterData(letter).charWidth;
};

const createImageData = async (text: string, size: number, color: string, space: number = 1) => {
  const id = text + color + size;
  if (bitmaps[id]) {
    return;
  }
  
  const spacing = space * size;
  
  // Calculate character widths and positions
  const characters = text.replace('!', '@').toUpperCase().split('');
  const charData = characters.map(character => {
    const letter = character === ' ' ? '0' : tinyFont[character.charCodeAt(0) - 35];
    const data = getCharacterData(letter);
    return { ...data, scaledWidth: data.charWidth * size };
  });
  
  // Calculate total width
  const totalWidth = charData.reduce((sum, char, i) => 
    sum + char.scaledWidth + (i < charData.length - 1 ? spacing : 0), 0);
  
  const letterHeight = 5 * size;
  const imageData = new ImageData(totalWidth, letterHeight);
  
  const [r, g, b, a] = hexToRgb(color);
  
  let xOffset = 0;
  charData.forEach(({ paddedBinary, leftmostCol, scaledWidth }) => {
    // Draw character starting from leftmost column
    paddedBinary.split('').forEach((bit, bitIndex) => {
      if (bit !== '0') {
        const col = bitIndex % 5;
        const row = Math.floor(bitIndex / 5);
        
        // Skip empty left columns
        if (col < leftmostCol) return;
        
        const adjustedCol = col - leftmostCol;
        
        for (let sy = 0; sy < size; sy++) {
          for (let sx = 0; sx < size; sx++) {
            const pixelX = xOffset + adjustedCol * size + sx;
            const pixelY = row * size + sy;
            const index = (pixelY * totalWidth + pixelX) * 4;
            
            imageData.data[index] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
            imageData.data[index + 3] = a || 255;
          }
        }
      }
    });
    
    xOffset += scaledWidth + spacing;
  });

  const bitmap = await createImageBitmap(imageData);
  bitmaps[id] = bitmap;
};

export const drawText = (
  c: CanvasRenderingContext2D,
  {
    text,
    color = colors.white,
    textAlign = 'left',
    textBaseline = 'top',
    size = 2,
    space = 1,
    ...rest
  }: DrawTextProps
) => {
  const x = Math.round(rest.x);
  const y = Math.round(rest.y);
  if (!text) text = ' ';
  
  // Calculate variable width for text
  const spacing = space * size;
  const characters = text.replace('!', '@').toUpperCase().split('');
  const totalWidth = characters.reduce((sum, character, i) => {
    const letter = character === ' ' ? '0' : tinyFont[character.charCodeAt(0) - 35];
    const charWidth = getCharacterWidth(letter) * size;
    return sum + charWidth + (i < characters.length - 1 ? spacing : 0);
  }, 0);
  
  const letterHeight = 5 * size;
  const id = text + color + size;
  const offsetX = textAlign === 'left' ? 0 : textAlign === 'center' ? Math.round(totalWidth / 2) : totalWidth;
  const offsetY = textBaseline === 'top' ? 0 : textBaseline === 'middle' ? Math.round(letterHeight / 2) : letterHeight;
  
  if (bitmaps[id]) {
    c.drawImage(bitmaps[id], 0, 0, totalWidth, letterHeight, x - offsetX, y - offsetY, totalWidth, letterHeight);
  } else {
    createImageData(text, size, color, space)
      .then(() => {
        c.drawImage(bitmaps[id], 0, 0, totalWidth, letterHeight, x - offsetX, y - offsetY, totalWidth, letterHeight);
      });
  }
};

// export const preLoadStrings = (strings: string[], textColors: string[], size: number) => {
//   strings.forEach(str => {
//     textColors.forEach(color => createImageData(str, size, color));
//   });
// };

// export const preLoadLevels = () => {
//   for (let i = 1; i <= 13; i++) {
//     preLoadStrings([`Level ${(' ' + i).slice(-2)}`], [colors.black], 4);
//   }
// };
