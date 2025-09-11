
const t = (i: number, n: number)=>(n-i)/n;

// Reuse a single AudioContext to avoid memory leaks
let audioCtx: AudioContext | null = null;

// Sound player
export const playSound = (f: (i: number) => number) => {
  if (!audioCtx) audioCtx = new AudioContext();
  const m = audioCtx.createBuffer(1,96e3,48e3);
  const b = m.getChannelData(0);
  for(let i = 96e3; i--;) b[i] = f(i);
  const s = audioCtx.createBufferSource();
  s.buffer=m;
  s.connect(audioCtx.destination);
  s.start();
};

// Sound
// export const ooof = (pitch: number) => playSound((i: number) => {
//   var n=2e4;
//   if (i > n) return 0;
//   var q = t(i,n);
//   return 0.2 * Math.tan(Math.cbrt(Math.sin(i/(145 - 5 * pitch))))*q*q;
// });

// export const doorSound = () => playSound((i: number) => {
//   return 0.1 * Math.sin(i/50 + Math.random()*50) * (8000 - i%8000) / 5000 * Math.exp(-i/8000);
// });

export const step = () => playSound((i: number) => {
  // Soft noise burst, short, with gentle fade in/out
  const n = 2000;
  if (i > n) return 0;
  // Fade in/out envelope
  const env = Math.sin((Math.PI * i) / n);
  // Simple lowpass: average with previous value
  let prev = 0, out = 0;
  out = ((Math.random() * 2 - 1) + prev) / 2;
  prev = out;
  return 0.15 * out * env;
});

export const attack5 = () => playSound((i: number) => {
  const n = 29e3;
  if (i > n) return 0;
  const decay = i > n * 0.6 ? Math.pow(0.9999, i - n * 0.6) : 1;
  const phase = 5 * Math.sin(5 * Math.round(5 * i / n));
  return decay * 0.2 * Math.sin(i/(30 - phase) + Math.random()) * (8000 - i%6000) / 5000;
});

export const attack = () => playSound((i: number) => {
  const n = 10e3;
  if (i > n) return 0;
  const decay = Math.pow(0.998, i / 10);
  const phase = 5 * Math.sin(5 * Math.round(5 * i / n));
  return decay * 0.2 * Math.sin(i/(40 - phase) + Math.random()) * (8000 - i%6000) / 5000;
});

export const meow = (pitch: number) => playSound((i: number) => {
  return Math.sin(i/(20 - pitch) + Math.sin(i/2000)*5) * Math.exp(-i/4000) * (i/96000) * 9;
});

export const heal = () => ((i: number) => {
  const n = 6e3;
  if (i > n) return null;
  var q = (n - i) / n;
  return Math.sin(i*0.01*Math.sin(0.007*i+Math.sin(i/1200))+Math.sin(i/800))*q*q;
});
