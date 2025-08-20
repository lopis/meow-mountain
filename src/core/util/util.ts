
export const easeInOutSine = (x: number, min: number, max: number): number => {
  const ease = -(Math.cos(Math.PI * x) - 1) / 2;
  return min + ease * max;
};
