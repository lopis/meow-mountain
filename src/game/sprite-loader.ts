export const generateImageData = (icon: string, iconPalette: string[]): HTMLImageElement => {
  const palette = ['#000000', ...iconPalette];
  
  const colorsPerByte = palette.length > 4 ? 2 : palette.length > 2 ? 3 : 6;
  const bytesPerColor = 6 / colorsPerByte;
  const bitMask = (1 << bytesPerColor) - 1;
  const canvas = document.createElement('canvas');
  const size = Math.sqrt(icon.length * colorsPerByte);
  canvas.setAttribute('width', size.toString());
  canvas.setAttribute('height', size.toString());
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  
  let i = 0;
  [...icon].map(c => {
    const z = c.charCodeAt(0);

    for (let bit = 0; bit < colorsPerByte; bit++) {
      const paletteIndex = (z >> bit * bytesPerColor) & bitMask;
      const hexColor = palette[paletteIndex] || '#000000';
      
      // Convert hex to RGB
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const a = paletteIndex ? 255 : 0;
      
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
      i += 4;
    }
  });

  
  ctx.putImageData(imgData, 0, 0);
  const img = new Image();
  img.src = canvas.toDataURL();
  if (palette.length > 2) {
    console.log(icon);
  }
  return img;
};
