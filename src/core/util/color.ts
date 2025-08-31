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

// @ts-expect-error
export const colors: Record<Color, string> = new Proxy({}, {
  get: (_, prop: string) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return '';
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--${prop}`);
    return value.trim() || '';
  }
});
