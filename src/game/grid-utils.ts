export const forEachSurroundingCell = (
  centerCol: number,
  centerRow: number,
  callback: (col: number, row: number) => void,
  includeCenter: boolean = false
) => {
  for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
    for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
      if (!includeCenter && deltaRow === 0 && deltaCol === 0) continue;
      callback(centerCol + deltaCol, centerRow + deltaRow);
    }
  }
};
