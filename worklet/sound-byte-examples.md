# Sound byte examples

## Toc Toc

```js
    (t, p) => Math.sin(t * p * 0.8)
```

## Strings

```js
(t, p) => {
  // Mix sine and sawtooth for string timbre
  const sine = Math.sin(t * p * 0.1);
  const saw = ((t * p * 0.1) % (2 * Math.PI)) / Math.PI - 1;
  return (sine + saw * 0.6);
}
```

## Xylophone

```js
(t, p) => {
  // Sine wave with gentle vibrato and slow attack/decay
  const vibrato = Math.sin(t * 0.008) * 0.04;
  const env = Math.min(1, t * 0.002) * Math.exp(-t * 0.00012); // slow attack, slow decay
  return Math.sin(t * p * 0.05 + vibrato) * env;
}
```
