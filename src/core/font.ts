import { hexToRgb, colors } from "@/core/util/color";

export const tinyFont = /* font-start */'6v7ic,2rwzo,6nvic,58jgo,55eyo,2np50,2jcjo,3ugt8,34ao,7k,b28,m0,20o0o,9a7vy,jbmjj,jf63j,ivhmn,etrs7,ju8e7,jalrz,jeyks,jwdj3,jwdlv,2t8g,2t8s,34yo,lskg,m2yo,jf4lo,jysjy,98ruh,j8htq,9v7zj,j8d32,ju78f,ju8t4,9ul2n,g44e1,jykrj,jewdq,g4rbt,fgsgv,hha5t,g6xgz,98rou,j8d7c,98uwe,j8d7d,9xgxq,jykqs,g3zn2,g3z9g,b1ipn,h4qu3,c8oz2,jhyfz,7uq18,,3xjqe,'/* font-end */.split(',');

const bitmaps: { [key: string]: ImageBitmap } = {};

export const HEART = '#';
export const BROKEN_HEART = '%';

export type DrawTextProps = {
  text: string
  x: number
  y: number
  color?: string
  textAlign?: CanvasTextAlign
  textBaseline?: CanvasTextBaseline
  size?: number
  maxLetters?: number
  space?: number
}

const createImageData = async (text: string, size: number, color: string, space: number = 1) => {
  const id = text + color + size;
  if (bitmaps[id]) {
    return;
  }
  const letterWidth = 5 * size;
  const spacing = space * size;
  const spaced = letterWidth + spacing;
  const width = spaced * text.length - spacing;
  const imageData = new ImageData(width, letterWidth);
  // this.context.getImageData(x - offsetX, y + offsetY, width, 5);
  const [r, g, b, a] = hexToRgb(color);
  text
    .replace('!', '@')
    .toUpperCase().split('').forEach((character: string, i) => {
      // @ts-ignore
      const letter = character === ' ' ? '0' : tinyFont[character.charCodeAt(0) - 35];
      const paddedBinary = String(parseInt(letter, 36).toString(2)).padStart(25, '0');
      paddedBinary.split('').forEach((bit, j) => {
        if (bit !== '0') {
          for (let q = 0; q < size; q++) {
            const jSize = j * size;
            const baseIndex = (
              (i * spaced) + // character
              (jSize % (letterWidth)) + // pixel
              (size * width * Math.floor(jSize / letterWidth)) + // line
              (width * q)
            ) * 4;

            // Draw 1 pixel (4 channels)
            for (let p = 0; p < size; p++) {
              const index = p * 4 + baseIndex;
              imageData.data[index] = r;
              imageData.data[index + 1] = g;
              imageData.data[index + 2] = b;
              imageData.data[index + 3] = a || 255;
            }
          }
        }
      });
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
    maxLetters = 999,
    space = 1,
    ...rest
  }: DrawTextProps
) => {
  const x = Math.round(rest.x);
  const y = Math.round(rest.y);
  if (!text) text = ' ';
  const letterWidth = 5 * size;
  const spacing = space * size;
  const spaced = letterWidth + spacing;
  const width = spaced * text.length - spacing;
  const id = text + color + size;
  const offsetX = textAlign === 'left' ? 0 : textAlign === 'center' ? Math.round(width / 2) : width;
  const offsetY = textBaseline === 'top' ? 0 : textBaseline === 'middle' ? Math.round(letterWidth / 2) : letterWidth;
  if (bitmaps[id]) {
    const maxWidth = maxLetters * spaced;
    c.drawImage(bitmaps[id], 0, 0, maxWidth, spaced, x - offsetX, y - offsetY, maxWidth, spaced);
  } else {
    createImageData(text, size, color, space)
      .then(() => {
        const maxWidth = maxLetters * spaced;
        c.drawImage(bitmaps[id], 0, 0, maxWidth, spaced, x - offsetX, y - offsetY, maxWidth, spaced);
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
