/// <reference lib="webworker" />
/// <reference lib="dom" />

const SAMPLE_RATE = 40000;
const NOTE_LENGTH = SAMPLE_RATE / 4;

type PitchLength = { pitch: number; length: number; } | undefined;

const BaseSound = (
  pitchOffset: number,
  sustainTime: number,
  volume: number,
  s: (t:number, p:number) => number,
) => (value: PitchLength) => {
  const {pitch, length} = value || {pitch: 0, length: 1};
  let t = 0;
  const p = 2 ** ((pitch - pitchOffset * 12) / 12) * 1.24;
  const decay = Math.pow(0.9999, 2 / (length));
  return function render() {
    if (pitch === 0) return 0;
    // let s = (((t * p) / 2) & 202) / 120 - 0.75;
    ++t;
    if (t >= (length * NOTE_LENGTH)) {
      return undefined;
    };
    const sustain = t <= length * NOTE_LENGTH * sustainTime ? 1 : Math.pow(decay, t - length * NOTE_LENGTH * sustainTime);
    return s(t,p) * sustain * volume;
  };
}

const MainSound = BaseSound(
  0,
  0.4,
  0.3,
  (t,p) => (((t * p) / 2) & 202) / 120 - 0.75
);
const MainHighSound = BaseSound(
  -1,
  0.4,
  0.3,
  (t,p) => (((t * p) / 2) & 512) / 120 - 0.75
);
const BackgroundSound = BaseSound(
  4,
  0.1,
  2,
  (t,p) => Math.tan(Math.cbrt(Math.sin((t * p) / 30))),
);

const genNotes = (str: string): {
    notes: PitchLength[];
    totalLength: number;
} => {
  const totalLength = str.split(',').reduce((prev: number, n: string): number => {
    const [_note, length] = n.split('~');
    return (parseInt(length) || 1) + prev;
  }, 0);
  const notesArray: PitchLength[] = Array.from({ length: totalLength });
  let index = 0;
  str.split(',')
  .forEach(n => {
    const [note, length] = n.split('~');
    const noteLength = (isNaN(parseInt(length)) ? 1 : parseInt(length));
    notesArray[index] = {
      pitch: (isNaN(parseInt(note)) ? 0 : parseInt(note)),
      length: noteLength,
    };
    index += noteLength; // Use the parsed length, not the array value
  });

  return {
    notes: notesArray,
    totalLength,
  };
};

// const lowPart1 =
//   '11 -1 11,,11 15 18,,-9 3,,11 15 18,,-2 10,,18 13 10 10,,3 -9,,18 13 10 10,,';
// const lowPart2 =
//   '10 -2 10,,13 9 4,,3 -9,,9 13 4,,3 -9,,10 13 6,,4 -8,,-6 6 10 13,';
// const low = `${lowPart1}${lowPart1}${lowPart1}${lowPart2},11 -1,,11 15 18,,-9 3,,11 15 18,,-2 10,,18 13 10 10,,3 -9,,18 13 10 10,,${lowPart1}${lowPart1}${lowPart2}`;
// const lowNotes = {
//   gen: Square,
//   notes: genNotes(
//     `${low},${low},,,`
//   )
// };

// const highPart1 =
//   "17,18 6,19 7,20 8,21 9,,22 10,,23 11,,24 12,,25 13,,26 14,,27 15 26,,27 15 26,,27 15 26,,";
// const highPart2 = "27 15 26,,27 15 26,,26 14,,25 13,,24 12,,5";
// const highPart3 =
//   "5 17 22 29,,5 17 20 29,,,,5 17 21 29,,0 12 21 29,,4 21 16 28,,3 21 15 27,,2 21 14 26,,4 12 24,,2 14 26,,1 13 25,,0 12 24,,3 -1 11 23,,0 12 24,,-2 10 22,,-2 10 22,,29 24 21 19 14,,29 21 19 14 24,,,,29 21 19 14,,29 14 19 21,,28 21 17 12,,27 21 16 11,,26 21 14,,-6 18,29 17,16 28,27 15,26 14,25 13,24 12,23 11,22 10,21 9,20 8,19 7,18 6,17 5,16 4,15 3,17 28 29,,17 29,,17 29,,17 29,,17 29,,28 15,,27 14,,26 13,,25 12,,24 11,,23 10,,22 9,,21 8,,22 10,,23 11,,24 12,,12 17 28 29 5,,28 17 12 5 29 24,,28 26 17 12 5 29,,28 17 12 5 29,,28 17 12 5 29,,4 16 28,,27 15,,26 14,,25 13,,,,19 8,,6,,5 17,,,,14";
// const highNotes = {
//   gen: Tri,
//   notes: genNotes(
//     `5 9 ${highPart1} ${highPart2} ${highPart1} 26 15,,27 26 15,,27 26 15,,28 16,,28 16,,5 ${highPart1} ${highPart2} 17,18 6,19 7,20 8,21 9,,22 10,22 10,23 11,,24 12,,25 13,,26 14,,27 15 26,,27 15 26,,27 15 26,,27 26 15,,28 16,,28 16,,28 16,,28 16,,${highPart3},,,`
//   )
// };

type Voice = {
  gen: (value: any) => () => number | undefined;
  notes: PitchLength[];
  totalLength: number;
}

const boleroMain: Voice = {
  gen: MainSound,
  ...genNotes(
    '27~6,26~1,27~1,29~1,27~1,26~1,24~1,27~2,27~1,24~1,27~6,26~1,27~1,24~1,22~1,19~1,20~1,22~9,20~1,19~1,17~1,19~1,20~1,22~1,24~1,22~9,24~1,26~1,24~1,22~1,20~1,19~1,17~1,19~1,17~1,15~4,15~1,17~1,19~1,~1,20~1,~1,17~4,22~17,~3,29~7,27~1,26~1,24~1,26~1,27~1,29~1,27~1,26~3,27~1,26~1,24~1,27~1,26~1,24~1,20~3,20~1,20~1,20~1,~1,24~1,~1,27~1,24~1,26~1,22~1,20~2,20~1,20~1,20~1,~1,24~1,~1,26~1,22~1,24~1,20~1,17~2,17~1,15~1,17~6,17~1,17~1,17~1,~1,20~1,~1,24~1,20~1,22~1,19~1,17~2,17~1,15~1,17~6,17~1,15~1,17~2,19~1,20~1,22~9,20~1,19~1,17~1,15~2,22~1,22~1,22~1,~1,22~1,22~1,22~1,~1,22~1,~1,22~1,~1,22~1,22~1,22~1,~1,22~1,22~1,22~1,22~1,22~1,22~1,22~1'
  )
};

const boleroHigh: Voice = {
  ...boleroMain,
  gen: MainSound,
}

const boleroBase: Voice = {
  gen: BackgroundSound,
  ...genNotes('10~4,22~4,10~4,10~4,22~4,10~2,10~2,'.repeat(8).slice(0, -1)),
}

let music: Voice[] = [boleroHigh, boleroBase];
console.log(music);


let queue: (() => number | undefined)[] = [];

const processNote = (t: number, playbackRate: number, voices: Voice[]) => {
  t = Math.round(t * playbackRate);
  t |= 0;
  let out = 0;
  
  for (let voice of voices) {
    let currentTime = 0;
    for (let noteIndex = 0; noteIndex < voice.notes.length; noteIndex++) {
      const note = voice.notes[noteIndex];
      if (!note) continue;
      
      const noteDuration = note.length * NOTE_LENGTH;
      
      if (t === currentTime) {
        const genFn = voice.gen(note);
        queue.push(genFn);
      }
      
      currentTime += noteDuration;
      if (t < currentTime) break;
    }
  }
  
  for (let i = 0; i < queue.length; ++i) {
    let result = queue[i]();
    if (result !== undefined) out += result;
    else queue.splice(i--, 1);
  }
  return out / 8;
};

class MusicProcessor extends AudioWorkletProcessor {
  playbackRate = 1;
  currentIndex = 0;
  chunkSize = 128; // Adjust chunk size as needed
  sampleCount = music[0].notes.reduce((total, note) => {
    return total + ((note?.length || 0) * SAMPLE_RATE / 4);
  }, 0);

  constructor() {
    super();
    this.port.onmessage = (event) => {
      const data = event.data;
    };
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], _parameters: Map<string, Float32Array>) {
    const outputBuffer = outputs[0][0]; // Assuming mono output
    const startIndex = this.currentIndex;
    const endIndex = this.currentIndex + this.chunkSize;

    for (let i = startIndex; i < endIndex; i++) {
      outputBuffer[i - startIndex] = processNote(i, this.playbackRate, music);
    }

    this.currentIndex = endIndex;

    const end = (this.sampleCount / this.playbackRate);
    if (this.currentIndex > end) {
      this.currentIndex = 0;
    }

    return true; // Continue processing
  }
}

registerProcessor('music-processor', MusicProcessor);
