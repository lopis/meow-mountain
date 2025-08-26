import { CELL_WIDTH, CELL_HEIGHT } from '../game/constants';

export interface SmoothMovementState {
  x: number;
  y: number;
  targetPos: { x: number; y: number };
  moving: { x: number; y: number };
  speed: number;
}

/**
 * Updates position smoothly towards target position using linear interpolation
 * @param state Object containing position, target, and movement state
 * @param timeElapsed Time elapsed since last update in milliseconds
 */
export function updatePositionSmoothly(state: SmoothMovementState, timeElapsed: number): void {
  for (const axis of ['x', 'y'] as const) {
    if (state[axis] !== state.targetPos[axis]) {
      const d = state.targetPos[axis] - state[axis];
      const step = Math.sign(d) * state.speed * timeElapsed / 1000;
      if (Math.abs(step) >= Math.abs(d)) {
        state[axis] = state.targetPos[axis];
      } else {
        state[axis] += step;
      }
    } else {
      state.moving[axis] = 0;
      state[axis] = Math.round(state[axis]);
    }
  }
}

/**
 * Sets target position in pixel coordinates based on grid cell coordinates
 * @param state Movement state object
 * @param col Grid column
 * @param row Grid row
 */
export function setTargetPosition(state: SmoothMovementState, col: number, row: number): void {
  state.targetPos.x = col * CELL_WIDTH;
  state.targetPos.y = row * CELL_HEIGHT;
}

/**
 * Moves towards a target grid position if the move is valid
 * @param state Movement state object
 * @param targetCol Target column
 * @param targetRow Target row
 * @param currentCol Current column (will be updated)
 * @param currentRow Current row (will be updated)
 * @param isValidMove Function to check if move is valid
 * @returns true if movement was initiated, false otherwise
 */
export function moveToGridPosition(
  state: SmoothMovementState,
  targetCol: number,
  targetRow: number,
  currentCol: { value: number },
  currentRow: { value: number },
  isValidMove: (col: number, row: number) => boolean
): boolean {
  if (!isValidMove(targetCol, targetRow)) {
    return false;
  }

  // Calculate movement direction
  const deltaCol = targetCol - currentCol.value;
  const deltaRow = targetRow - currentRow.value;

  // Update grid position
  currentCol.value = targetCol;
  currentRow.value = targetRow;

  // Set movement direction
  state.moving.x = Math.sign(deltaCol);
  state.moving.y = Math.sign(deltaRow);

  // Set target pixel position
  setTargetPosition(state, targetCol, targetRow);

  return true;
}
