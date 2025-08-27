export interface Drawable {
  col: number;
  row: number;
  draw: () => void;
  type: string;
  update?: (timeElapsed: number) => void;
}

export interface Cell {
  x: number;
  y: number;
  content: Drawable | null;
  seen?: boolean;
  marked?: number;
}

export type Path = [{ x: number, y: number }, { x: number, y: number }, number];
export type Circle = { x: number, y: number, r: number };
