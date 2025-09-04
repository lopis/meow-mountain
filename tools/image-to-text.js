import { imageToPalette } from "./image-to-palette.js";

//#node
function flatArrayToString(imageData) {
  const { pixels: flatArray, palette } = imageData;
  const paletteSize = palette.length;
  const inc = paletteSize == 3 ? 2 : paletteSize == 2 ? 3 : 6; // nr of bytes

  let str = '';
  for(let i = 0; i < flatArray.length; i += inc) {
    // Encode multiple pixels together
    // pallete size 8 -> 3 bits -> 2 pixels per char
    //              4 -> 2 bits -> 3 pixels per char
    //              2 -> 1 bit  -> 6 pixels per char
    if (paletteSize.value === '3') {
      str += String.fromCharCode(0b1000000 + (flatArray[i] || 0) + ((flatArray[i+1] || 0) << 3));
    } else if (paletteSize.value === '2') {
      str += String.fromCharCode(
        0b1000000 +
        (flatArray[i] || 0) +
        ((flatArray[i+1] || 0) << 2) +
        ((flatArray[i+2] || 0) << 4)
      )
    } else {
      str += String.fromCharCode(
        0b1000000 +
        (flatArray[i] || 0) +
        ((flatArray[i+1] || 0) << 1) +
        ((flatArray[i+2] || 0) << 2) +
        ((flatArray[i+3] || 0) << 3) +
        ((flatArray[i+4] || 0) << 4) +
        ((flatArray[i+5] || 0) << 5)
      )
    }
  }
  return str;
}


// If run directly, process command line arguments
if (process.argv[1].endsWith('image-to-text.js')) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node image-to-palette.js <image-file-path>');
    console.log('Example: node image-to-palette.js ./my-sprite.png');
  } else {
    const imageData = await imageToPalette(args[0]);
    console.log(flatArrayToString(imageData));
  }
}
