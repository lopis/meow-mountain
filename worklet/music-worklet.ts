/// <reference lib="webworker" />
/// <reference lib="dom" />

const SAMPLE_RATE = 40000;
const NOTE_LENGTH = SAMPLE_RATE / 4;

type PitchLength = [ number, number ] | undefined;

type Voice = {
  gen: (value: any) => () => number | undefined;
  notes: PitchLength[];
  totalLength: number;
}

const BaseSound = (
  pitchOffset: number,
  sustainTime: number,
  volume: number,
  s: (t:number, p:number) => number,
) => (value: PitchLength) => {
  const [pitch, length] = value || [0, 1];
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

const genNotes = (str: string): {
    notes: PitchLength[];
    totalLength: number;
} => {
  const totalLength = str.split(',').reduce((prev: number, n: string): number => {
    const [_note, length] = n.split('');
    return (parseInt(length) || 1) + prev;
  }, 0);
  const notesArray: PitchLength[] = Array.from({ length: totalLength });
  let index = 0;
  str.split(',')
  .forEach(n => {
    const [note32, length] = n.split('');
    const note = parseInt(note32, 32);
    const noteLength = (isNaN(parseInt(length)) ? 1 : parseInt(length));
    notesArray[index] = [
      (isNaN(note) ? 0 : note),
      noteLength,
    ];
    index += noteLength; // Use the parsed length, not the array value
  });

  return {
    notes: notesArray,
    totalLength,
  };
};

const boleroMain: Voice = {
  gen: BaseSound(
    0,
    0.65,
    0.7,
    (t,p) => (((t * p) / 2) & 202) / 120 - 0.75,
  ),
  ...genNotes(
    'r6,q1,r1,t1,r1,q1,o1,r2,r1,o1,r6,q1,r1,o1,m1,j1,k1,m9,k1,j1,h1,j1,k1,m1,o1,m9,o1,q1,o1,m1,k1,j1,h1,j1,h1,f4,f1,h1,j1,~1,k1,~1,h4,mh,~3,t7,r1,q1,o1,q1,r1,t1,r1,q3,r1,q1,o1,r1,q1,o1,k3,k1,k1,k1,~1,o1,~1,r1,o1,q1,m1,k2,k1,k1,k1,~1,o1,~1,q1,m1,o1,k1,h2,h1,f1,h6,h1,h1,h1,~1,k1,~1,o1,k1,m1,j1,h2,h1,f1,h6,h1,f1,h2,j1,k1,m9,k1,j1,h1,f2,m1,m1,m1,~1,m1,m1,m1,~1,m1,~1,m1,~1,m1,m1,m1,~1,m1,m1,m1,m1,m1,m1,m1'
  )
};

// const boleroHigh: Voice = {
//   ...boleroMain,
//   gen: MainSound,
// }

const boleroBase: Voice = {
  gen: BaseSound(
    4,
    0.2,
    0.7,
    (t, p) => {
      // Warm, textured bass: mostly sine, a touch of saw, subtle noise
      const sine = Math.sin(t * p * 0.05);
      const saw = ((t * p * 0.05) % (2 * Math.PI)) / Math.PI - 1;
      return sine + saw * 0.5 + (Math.random() * 2 - 1) * 0.06;
    }
  ),
  ...genNotes('a4,m4,a4,a4,m4,a2,a2,'.repeat(8).slice(0, -1)),
}

const boleroShort: Voice = {
  ...boleroBase,
  ...genNotes('a4,m4,a4,a4,m4,a2,a2'),
}

// let music: Voice[] = [boleroMain, boleroBase];
let music: Voice[] = [boleroShort];

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
      
      const noteDuration = note[1] * NOTE_LENGTH;
      
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
  playMelody = false;
  paused = false;
  playbackRate = 1;
  currentIndex = 0;
  chunkSize = 128; // Adjust chunk size as needed
  sampleCount = music[0].totalLength * NOTE_LENGTH;

  constructor() {
    super();
    this.port.onmessage = (event) => {
      const eventID = event.data;
      switch (eventID) {
        case 0: // 'start':
          this.playMelody = true;
          break;
        case 1: // 'pause':
          this.paused = true;          
          break;
        case 2: // 'unpause':
          this.paused = false;
          break;
        default:
          break;
      }
    };
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], _parameters: Map<string, Float32Array>) {
    if (this.paused) {
      // Fill output with silence
      const output = outputs[0][0];
      output.fill(0);
      return true;
    }

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
      this.port.postMessage('next step');
      if (this.playMelody) {
        music = [boleroMain, boleroBase];
        this.sampleCount = music[0].totalLength * NOTE_LENGTH;
      }
    }

    return true; // Continue processing
  }
}

registerProcessor('mp', MusicProcessor);
