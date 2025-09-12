import { Circle, Path } from './types';

export const CELL_WIDTH = 12;
export const CELL_HEIGHT = 11;

export const MAX_LIVES = 9;
export const MAX_MAGIC = 6;
export const MAX_REPAIR = 20;

export const NOTIFICATION_DURATION = 5000;

export const paths: Path[] = [
  // Main path
  [[69, 100, 3], [76, 113, 4], [89, 114, 5], [104, 86, 3], [99, 59, 3], [85, 46, 2], [86, 28, 2], [74, 38, 2], [60, 39, 2], [48, 30, 2], [46, 43, 2], [38, 61, 3], [50, 73, 4], [38, 84, 3], [46, 123, 3], [36, 133, 2], [48, 141, 3], [94, 133, 4], [113, 109, 5], [122, 74, 6], [113, 56, 0.9]],

  // Smaller paths
  [[45, 49, 0.9], [71, 51, 0.9]],

  // Northwest village path
  [[119, 54, 1], [129, 29, 1]],
];

export const clearings: Circle[] = [
  // Peak
  { x: 64, y: 88, r: 6 },
  { x: 75, y: 88, r: 6 },
  { x: 69, y: 95, r: 6 },

  // Northeast village
  { x: 129, y: 28, r: 10 },

  // Eye
  { x: 71, y: 51, r: 3 },
];

export const statues = {
  heart: { x: 76, y: 84, name: 'heart' },
  moon: { x: 129, y: 19, name: 'moon' },
  ear: { x: 49, y: 29, name: 'ear' },
  eye: { x: 71, y: 50, name: 'eye' },
  foot: { x: 35, y: 131, name: 'foot' },
  tail: { x: 114, y: 56, name: 'tail' },
} as const;
