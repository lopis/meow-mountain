import { Village } from './entities/village';

export interface Drawable {
  col: number;
  row: number;
  draw: () => void;
  postDraw?: () => void;
  type: string;
  name?: string;
  update?: (timeElapsed: number) => void;
}

export interface Cell {
  x: number;
  y: number;
  content: Drawable | null;
  seen?: boolean;
  village?: Village;
}

type Point = [x: number, y: number, w: number];
export type Path = Point[];
export type Circle = { x: number, y: number, r: number };
