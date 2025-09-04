import path from "path";
import fs from "fs/promises";
import { flatArrayToString } from "./image-to-text.js";
import { imageToPalette } from "./image-to-palette.js";

/**
 * Extracts a single frame from the sprite sheet
 */
function extractFrame(imageData, frameSize, frameCol, frameRow) {
  const { pixels, width } = imageData;
  const framePixels = [];
  
  const startX = frameCol * frameSize;
  const startY = frameRow * frameSize;
  
  for (let y = 0; y < frameSize; y++) {
    for (let x = 0; x < frameSize; x++) {
      const sourceX = startX + x;
      const sourceY = startY + y;
      const sourceIndex = sourceY * width + sourceX;
      framePixels.push(pixels[sourceIndex]);
    }
  }
  
  return framePixels;
}

/**
 * Processes a single icon from the manifest
 */
async function processIcon(iconConfig) {
  console.log(`Processing ${iconConfig.name}...`);
  
  try {
    // Load and process the image
    const imagePath = path.resolve(path.dirname(import.meta.url.replace('file://', '')), iconConfig.file);
    const imageData = await imageToPalette(imagePath);
    
    console.log(`  Image: ${imageData.width}x${imageData.height}`);
    console.log(`  Palette: ${imageData.palette.length} colors`);
    
    // Check if this is a single sprite or a spritesheet
    if (!iconConfig.frames) {
      // Single sprite - convert entire image to string
      const imageString = flatArrayToString(
        imageData.pixels,
        imageData.palette.length,
      );
      
      return {
        name: iconConfig.name,
        size: iconConfig.size,
        palette: imageData.palette,
        image: imageString
      };
    }
    
    // Spritesheet - process each animation (row) and its frames
    const animations = {};
    
    for (let rowIndex = 0; rowIndex < iconConfig.rows.length; rowIndex++) {
      const animationName = iconConfig.rows[rowIndex];
      const frameStrings = [];
      
      // Extract each frame for this animation
      for (let frameIndex = 0; frameIndex < iconConfig.frames; frameIndex++) {
        const framePixels = extractFrame(imageData, iconConfig.size, frameIndex, rowIndex);
        const frameString = flatArrayToString(
          framePixels,
          imageData.palette.length,
        );
        frameStrings.push(frameString);
      }
      
      animations[animationName] = frameStrings;
    }
    
    return {
      name: iconConfig.name,
      size: iconConfig.size,
      frames: iconConfig.frames,
      palette: imageData.palette,
      animations
    };
    
  } catch (error) {
    console.error(`Error processing ${iconConfig.name}:`, error.message);
    throw error;
  }
}

/**
 * Processes all icons and generates the output file
 */
export async function generateIconData(icons) {
  console.log('Starting icon processing...');
  
  const processedIcons = {};
  
  for (const iconConfig of icons) {
    const iconData = await processIcon(iconConfig);
    
    // Build the output object based on whether it's a single sprite or spritesheet
    if (iconData.image !== undefined) {
      // Single sprite
      processedIcons[iconData.name] = {
        size: iconData.size,
        palette: iconData.palette,
        data: iconData.image
      };
    } else {
      // Spritesheet
      processedIcons[iconData.name] = {
        size: iconData.size,
        frames: iconData.frames,
        palette: iconData.palette,
        data: iconData.animations
      };
    }
  }
  
  // Generate the output file content
  const outputContent = `// Auto-generated icon data
// Generated on ${new Date().toISOString()}

export const icons = ${JSON.stringify(processedIcons, null, 2)};
`;
  
  // Write to output file
  const outputPath = path.resolve(path.dirname(import.meta.url.replace('file://', '')), 'output.js');
  await fs.writeFile(outputPath, outputContent);
  
  console.log(`✓ Generated icon data written to output.js`);
  console.log(`  Total icons: ${Object.keys(processedIcons).length}`);
  
  return processedIcons;
}
