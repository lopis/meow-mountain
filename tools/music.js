/* eslint-disable quote-props */

// const notes = bolero.notesList.filter(note => note.instrument == 23);

import fs from 'fs';

// Add after the existing imports
const notesText = fs.readFileSync('tools/notes_13.txt', 'utf-8');
const notes = notesText.split(';').map((line, i) => {
  const [time, type, length, instrument] = line.split(' ');
  return {
    time, type, length, instrument
  };
})
.filter(note => !!note.type)
.sort((a, b) => a.time - b.time);

const frequencies = {
  'C': -9,
  'C#': -8,
  'D': -7,
  'D#': -6,
  'E': -5,
  'F': -4,
  'F#': -3,
  'G': -2,
  'G#': -1,
  'A': 0,
  'A#': 1,
  'B': 2,
};

const regex = /^([A-G]#?)(\d)$/;

const justNotes = [];

const octaveOffset = 2;

notes.forEach(note => {
  if (!note.type) {
    console.log(note);
  }
  const match = note.type.match(regex);
  const noteName = match[1];
  const octave = parseInt(match[2]) - octaveOffset;
  const toneOffset = frequencies[noteName] + octave * 12;
  justNotes.push(`${toneOffset}~${note.length}`);
});

console.log(justNotes.slice(0, 80).join(','));
