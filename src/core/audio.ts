
const t = (i: number, n: number)=>(n-i)/n;

// Sound player
export const playSound = (f: (i: number) => number) => {
  const A = new AudioContext();
  const m = A.createBuffer(1,96e3,48e3);
  const b = m.getChannelData(0);
  for(let i = 96e3; i--;) b[i] = f(i);
  const s = A.createBufferSource();
  s.buffer=m;
  s.connect(A.destination);
  s.start();
};

// Sound
export const ooof = (pitch: number) => playSound((i: number) => {
  var n=2e4;
  if (i > n) return 0;
  var q = t(i,n);
  return 0.2 * Math.tan(Math.cbrt(Math.sin(i/(145 - 5 * pitch))))*q*q;
});

export const doorSound = () => playSound((i: number) => {
  return 0.1 * Math.sin(i/50 + Math.random()*50) * (8000 - i%8000) / 5000 * Math.exp(-i/8000);
});

export const step = () => playSound((i: number) => {
  return (Math.random() - 0.5) * 0.3 * Math.exp(-i/2000);
});
