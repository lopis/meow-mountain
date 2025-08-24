export const on = (event: string, listener: () => void) => {
  document.addEventListener(event, listener);
}

export const emit = (event: string) => {
  document.dispatchEvent(new Event(event));
}
