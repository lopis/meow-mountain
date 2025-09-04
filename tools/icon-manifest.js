import { generateIconData } from "./spritesheet-to-text.js";

export const icons = [
  {
    file: "../public/cat.png",
    name: "cat",
    size: 8,
    frames: 4,
    rows: [
      'sit',
      'idle',
      'walk',
      'run',
      'die',
      'scratch',
      'scared',
      'sleep',
    ]
  }
]

// If run directly, process all icons
if (process.argv[1].endsWith('icon-manifest.js')) {
  generateIconData(icons).catch(console.error);
}
