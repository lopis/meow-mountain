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
  black: '#1F0A00',
  white: '#FFFCEA',
  gray: '#A29782',
  light: '#CEC6AD',
};
