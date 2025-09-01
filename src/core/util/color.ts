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
  green0: '#e3ecd7',
  green1: '#6b9a71',
  green2: '#457a5f',
  green3: '#255056',
  blue0: '#b4ecf3',
  blue1: '#86bec6',
  blue2: '#4e9ca6',
  blue3: '#366c73',
  blue4: '#255056',
  blue5: '#1f4347',
  blue6: '#13282b',
  purple0: '#e3c5cf',
  purple1: '#b79fbb',
  purple2: '#8e8bb6',
  purple3: '#5f6791',
  purple4: '#8d5180',
  purple5: '#b67388',
  yellow0: '#fffef9',
  yellow1: '#efdbb3',
  yellow2: '#e1ae98',
  black: '#13282b',
  white: '#fffef9'
};
