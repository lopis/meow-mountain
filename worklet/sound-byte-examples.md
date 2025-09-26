# Sound byte examples

## Toc Toc

```js
    (t, p) => {
      const env = Math.exp(-t * 0.002); // Slower decay
      return Math.sin(t * p * 0.8) * env * 1.5;
    }
```

## Strings

```js
(t, p) => {
  const env = Math.exp(-t * 0.00015); // Slower decay, more sustain
  // Mix sine and sawtooth for string timbre
  const sine = Math.sin(t * p * 0.1);
  const saw = ((t * p * 0.1) % (2 * Math.PI)) / Math.PI - 1;
  return (sine + saw * 0.6) * env;
}
```
