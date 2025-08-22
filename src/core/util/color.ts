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

export const colors = {
  green0: '#e3ecd7',
  green1: '#6b9a71',
  green2: '#457a5f',
  green3: '#244f55',
  blue0: '#a5d5df',
  blue1: '#79b4d5',
  blue2: '#4d80ab',
  blue3: '#414776',
  blue4: '#33315d',
  blue5: '#2b2441',
  blue6: '#211729',
  purple0: '#e3c5cf',
  purple1: '#b79fbb',
  purple2: '#8e8bb6',
  purple3: '#5f6791',
  purple4: '#8d5180',
  purple5: '#b67388',
  yellow0: '#fffef9',
  yellow1: '#efdbb3',
  yellow2: '#e1ae98',
  black: '#211729',
  white: '#fffef9',
};
