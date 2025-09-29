export const hexToRgb = (hex: string) : number[] => {
  // @ts-ignore
  return hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])$/i,
    (_, r, g, b, a) => '#' + r + r + g + g + b + b + a + a)
    .substring(1)
    .match(/.{2}/g)
    .map(x => parseInt(x, 16)
  );
};


export type Color =
'green0' | 
'green1' | 
'green2' | 
'green3' | 
'blue0' | 
'blue1' | 
'blue2' | 
'blue3' | 
'blue4' | 
'blue5' | 
'blue6' | 
'purple0' | 
'purple1' | 
'purple2' | 
'purple3' | 
'purple4' | 
'purple5' | 
'yellow0' | 
'yellow1' | 
'yellow2' | 
'black' | 
'white';

// export const colors: Record<Color, string> = new Proxy({}, {
//   get: (_, prop: string) => {
//     if (typeof window === 'undefined' || typeof document === 'undefined') return '';
//     const value = getComputedStyle(document.documentElement).getPropertyValue(`--${prop}`);
//     return value.trim() || '';
//   }
// });

// function getColorsFromCSS() {
//   const root = document.documentElement;
//   const computedStyle = getComputedStyle(root);
  
//   const colorKeys = [
//     'green0', 'green1', 'green2', 'green3',
//     'blue0', 'blue1', 'blue2', 'blue3', 'blue4', 'blue5', 'blue6',
//     'purple0', 'purple1', 'purple2', 'purple3', 'purple4', 'purple5',
//     'yellow0', 'yellow1', 'yellow2',
//     'black', 'white'
//   ];
  
//   const colors = {};
//   colorKeys.forEach((key: string) => {
//     // @ts-expect-error
//     colors[key] = computedStyle.getPropertyValue(`--${key}`).trim();
//   });
  
//   return colors;
// }

export const colors: Record<Color, string> = {
  green0: '#b3d7ad',
  green1: '#7daf84',
  green2: '#4c8568',
  green3: '#396a50',
  blue0: '#b4ecf3',
  blue1: '#4e9ca6',
  blue2: '#3e8791',
  blue3: '#2f6269',
  blue4: '#255056',
  blue5: '#1f4347',
  blue6: '#13282b',
  purple0: '#e0b8d3',
  purple1: '#d49bc2',
  purple2: '#b34d92',
  purple3: '#551641',
  purple4: '#714162',
  purple5: '#996a8a',
  yellow0: '#fffef9',
  yellow1: '#f2daab',
  yellow2: '#e6a386',
  black: '#13282b',
  white: '#fffef9'
};
