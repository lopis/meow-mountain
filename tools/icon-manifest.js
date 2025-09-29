import { generateIconData } from './spritesheet-to-text.js';

export const icons = [
  {
    file: '../sprites/cat.png',
    name: 'cat',
    size: 10,
    frames: 4,
    rows: [
      'idle',
      'walk',
      'run',
      'die',
      'scratch',
      'scared',
      'sleep',
    ]
  },
  {
    file: '../sprites/villager.png',
    name: 'villager',
    size: 8,
    frames: 4,
    rows: [
      'walk',
      'idle',
      'scared',
    ]
  },
  {
    file: '../sprites/statue.png',
    name: 'statue',
    size: 16,
  },
  {
    file: '../sprites/obelisk.png',
    name: 'obelisk',
    size: 16,
  },
  {
    file: '../sprites/oak.png',
    name: 'oak',
    size: 16,
  },
  {
    file: '../sprites/spruce.png',
    name: 'spruce',
    size: 16,
  },
  {
    file: '../sprites/grass.png',
    name: 'grass',
    size: 16,
  },
  {
    file: '../sprites/house.png',
    name: 'house',
    size: 16,
  },
];

// If run directly, process all icons
if (process.argv[1].endsWith('icon-manifest.js')) {
  generateIconData(icons).catch(console.error);
}
