/* eslint-disable quote-props */

// const notes = bolero.notesList.filter(note => note.instrument == 23);

import fs from 'fs';

// Add after the existing imports
const notesText = fs.readFileSync('tools/notes_13.txt', 'utf-8');
const notes = notesText.split(';').map((line, i) => {
  const [time, type, length, instrument] = line.split(' ');
  return {
    time: Math.round(time).toString(), type, length, instrument
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
const octaveOffset = 3;
let currentTime = 0; // Time is 1-indexed
let lastBeat = -1;

notes
  .map(note => ({
    ...note,
    time: parseFloat(note.time),
    length: parseInt(note.length, 10)
  }))
  .forEach(note => {
    if (isNaN(note.time) || isNaN(note.length)) return;

    // Insert a rest if there's a gap
    if (note.time > currentTime) {
      justNotes.push(`~${note.time - currentTime}`);
      currentTime = note.time;
    }

    // Quantize to beat (integer part)
    const beat = Math.floor(note.time);
    if (beat === lastBeat) return; // skip extra notes in same beat
    lastBeat = beat;

    if (note.type && regex.test(note.type)) {
      const match = note.type.match(regex);
      const noteName = match[1];
      const octave = parseInt(match[2]) - octaveOffset;
      const toneOffset = frequencies[noteName] + octave * 12;
      justNotes.push(`${toneOffset}~${note.length}`);
    } else {
      justNotes.push(`~${note.length}`);
    }

    currentTime += note.length;
  });

console.log(justNotes.join(','));
