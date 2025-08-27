
export const easeInOutSine = (x: number, min: number, max: number): number => {
  const ease = -(Math.cos(Math.PI * x) - 1) / 2;
  return min + ease * max;
};

/**
 * Converts a value from 0 to 1 to an exponential ease.
 * @param x value from 0 to 1
 * @returns value from 0 to 1
 */
export const easeInExpo = (x: number, ease = 5): number => {
  return x === 1 ? 1 : 1 - Math.pow(2, -ease * x);
};
