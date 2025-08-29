const SAMPLE_RATE = 44000;

function Square(pitch) {
  let t = 0;
  const p = 2 ** (pitch / 12) * 1.24;
  return function render() {
    let s = (((t * p) / 2) & 128) / 96 - 0.75;
    ++t;
    if (t >= SAMPLE_RATE * 0.2) return undefined;
    return 0.2 * s * Math.pow(0.99985, t);
  };
}

function Tri(pitch) {
  let t = 0;
  const p = 2 ** (pitch / 12) / 1.24;
  return function render() {
    let s = Math.tan(Math.cbrt(Math.sin((t * p) / 30)));
    ++t;
    if (t >= SAMPLE_RATE) return undefined;
    return s * Math.pow(0.9999, 2 * t) * 0.2;
  };
}

const genNotes = (str) => {
  return str.split(",").map(value => {
    const values = value
      .split(" ")
      .flatMap(n => (isNaN(parseInt(n)) ? [] : [parseInt(n)]));
    
    return values;
  });
};

const lowPart1 =
  "11 -1 11,,11 15 18,,-9 3,,11 15 18,,-2 10,,18 13 10 10,,3 -9,,18 13 10 10,,";
const lowPart2 =
  "10 -2 10,,13 9 4,,3 -9,,9 13 4,,3 -9,,10 13 6,,4 -8,,-6 6 10 13,";
const low = `${lowPart1}${lowPart1}${lowPart1}${lowPart2},11 -1,,11 15 18,,-9 3,,11 15 18,,-2 10,,18 13 10 10,,3 -9,,18 13 10 10,,${lowPart1}${lowPart1}${lowPart2}`;
const lowNotes = {
  gen: Square,
  notes: genNotes(
    `${low},${low},,,`
  )
};

const highPart1 =
  "17,18 6,19 7,20 8,21 9,,22 10,,23 11,,24 12,,25 13,,26 14,,27 15 26,,27 15 26,,27 15 26,,";
const highPart2 = "27 15 26,,27 15 26,,26 14,,25 13,,24 12,,5";
const highPart3 =
  "5 17 22 29,,5 17 20 29,,,,5 17 21 29,,0 12 21 29,,4 21 16 28,,3 21 15 27,,2 21 14 26,,4 12 24,,2 14 26,,1 13 25,,0 12 24,,3 -1 11 23,,0 12 24,,-2 10 22,,-2 10 22,,29 24 21 19 14,,29 21 19 14 24,,,,29 21 19 14,,29 14 19 21,,28 21 17 12,,27 21 16 11,,26 21 14,,-6 18,29 17,16 28,27 15,26 14,25 13,24 12,23 11,22 10,21 9,20 8,19 7,18 6,17 5,16 4,15 3,17 28 29,,17 29,,17 29,,17 29,,17 29,,28 15,,27 14,,26 13,,25 12,,24 11,,23 10,,22 9,,21 8,,22 10,,23 11,,24 12,,12 17 28 29 5,,28 17 12 5 29 24,,28 26 17 12 5 29,,28 17 12 5 29,,28 17 12 5 29,,4 16 28,,27 15,,26 14,,25 13,,,,19 8,,6,,5 17,,,,14";
const highNotes = {
  gen: Tri,
  notes: genNotes(
    `5 9 ${highPart1} ${highPart2} ${highPart1} 26 15,,27 26 15,,27 26 15,,28 16,,28 16,,5 ${highPart1} ${highPart2} 17,18 6,19 7,20 8,21 9,,22 10,22 10,23 11,,24 12,,25 13,,26 14,,27 15 26,,27 15 26,,27 15 26,,27 26 15,,28 16,,28 16,,28 16,,28 16,,${highPart3},,,`
  )
};

const speedUpNotes = {
  gen: Tri,
  notes: genNotes('17 29,30 18,31 19,32 20,33 21,34 22,23 35,36 24')
};

let music = [highNotes, lowNotes];

let queue = [];
const noteLength = SAMPLE_RATE / 8;
const processNote = (t, playbackRate, voices) => {
  t = Math.round(t * playbackRate);
  t |= 0;
  let out = 0;
  if (t % noteLength == 0) {
    for (let voice of voices) {
      if (voice.notes[t / noteLength] !== undefined) {
        const values = voice.notes[t / noteLength];
        for (let value of values) {
          queue.push(voice.gen(value));
        }
      }
    }
  }
  for (let i = 0; i < queue.length; ++i) {
    let result = queue[i]();
    if (result !== undefined) out += result;
    else queue.splice(i, 1);
  }
  return out / 8;
};

const STATE_NORMAL = 0;
const STATE_ONLY_LOW = 1;
const STATE_WAITING = 2;

class MusicProcessor extends AudioWorkletProcessor {
  speedUp = false;
  playbackRate = 1;
  state = STATE_NORMAL;

  constructor() {
    super();
    
    this.currentIndex = 0;
    this.chunkSize = 128; // Adjust chunk size as needed
    this.sampleCount = highNotes.notes.length * SAMPLE_RATE / 8;

    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    const data = event.data;
    if (data.name === "speed-up") {
      this.speedUp = true;
      this.currentIndex = 0;
    }
    if (data.name === "voices") {
      if (data.high && this.state === STATE_ONLY_LOW) {
        this.state = STATE_WAITING;
      } else if(!data.high) {
        this.state = STATE_ONLY_LOW;
        music = [lowNotes];
      }

    }
  }

  process(_inputs, outputs, _parameters) {
    const outputBuffer = outputs[0][0]; // Assuming mono output
    const startIndex = this.currentIndex;
    const endIndex = this.currentIndex + this.chunkSize;

    for (let i = startIndex; i < endIndex; i++) {
      outputBuffer[i - startIndex] = processNote(i, this.playbackRate, this.speedUp ? [speedUpNotes] : music);
    }

    this.currentIndex = endIndex;

    const end = (this.sampleCount / this.playbackRate);
    if (this.currentIndex > end) {
      this.currentIndex = 0;
    }

    if((this.currentIndex === 0 || this.currentIndex >= end/4) && this.state === STATE_WAITING) {
      this.currentIndex = 0;
      this.state = STATE_NORMAL;
      music = [highNotes, lowNotes];
    }

    return true; // Continue processing
  }
}

registerProcessor("music-processor", MusicProcessor);
