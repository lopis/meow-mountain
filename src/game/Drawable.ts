export interface Drawable {
  col: number;
  row: number;
  type: string;
  name?: string;
  update?: (timeElapsed: number) => void;
  updateAnimation?: (timeElapsed: number) => void;
  draw: () => void;
  postDraw?: () => void;
}
