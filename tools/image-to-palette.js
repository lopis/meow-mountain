/* eslint-disable id-denylist */
import Canvas from 'canvas';

/**
 * Converts an image file to a flat array of palette indices and extracts the color palette
 * Note: This function requires the 'canvas' package to be installed.
 * Install it with: npm install canvas
 * 
 * @param {string} filePath - Path to the image file
 * @returns {Promise<{pixels: number[], palette: string[], width: number, height: number}>}
 */
export async function imageToPalette(filePath) {
  let createCanvas, loadImage;
  
  try {
    // Try to import canvas package
    createCanvas = Canvas.createCanvas;
    loadImage = Canvas.loadImage;
  } catch (error) {
    throw new Error('Canvas package not found. Install it with: npm install canvas');
  }
  
  try {
    // Load the image
    const image = await loadImage(filePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);
    
    // Get the image data
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data; // RGBA array
    
    const colorMap = new Map(); // Maps hex color to palette index
    const palette = []; // Array of hex colors
    const pixels = []; // Array of palette indices
    
    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Convert to hex (handle transparency)
      let hexColor;
      if (a === 0) {
        // Transparent pixel
        hexColor = 'transparent';
      } else {
        // Convert RGB to hex
        hexColor = '#' + [r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');
      }
      
      // Check if this color is already in our palette
      if (!colorMap.has(hexColor)) {
        // Add new color to palette
        const index = palette.length;
        palette.push(hexColor);
        colorMap.set(hexColor, index);
      }
      
      // Add the palette index to our pixel array
      pixels.push(colorMap.get(hexColor));
    }
    
    return {
      pixels,
      palette,
      width: image.width,
      height: image.height
    };
    
  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Helper function to convert palette data back to a readable format
 * @param {object} paletteData - The result from imageToPalette
 * @returns {string} - Human readable representation
 */
export function paletteDataToString(paletteData) {
  const { pixels, palette, width, height } = paletteData;
  
  let result = `Image: ${width}x${height}\n`;
  result += `Colors found: ${palette.length}\n`;
  result += `Palette: ${palette.join(', ')}\n\n`;
  
  // Show pixel data as a grid (if small enough)
  if (width <= 32 && height <= 32) {
    result += 'Pixel indices:\n';
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        const index = pixels[y * width + x];
        row.push(index.toString().padStart(2, ' '));
      }
      result += row.join(' ') + '\n';
    }
  } else {
    result += `Pixel array: [${pixels.slice(0, 20).join(', ')}${pixels.length > 20 ? '...' : ''}]\n`;
  }
  
  return result;
}

// Example usage function
export async function processImageFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    const result = await imageToPalette(filePath);
    console.log(paletteDataToString(result));
    return result;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// If run directly, process command line arguments
if (process.argv[1].endsWith('image-to-palette.js')) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node image-to-palette.js <image-file-path>');
    console.log('Example: node image-to-palette.js ./my-sprite.png');
  } else {
    processImageFile(args[0]);
  }
}
