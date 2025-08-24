export const on = (event: string, listener: () => void) => {
  document.addEventListener(event, listener);
}

export const emit = (event: string) => {
  console.log(`[Event] Emitting event: ${event}`);
  document.dispatchEvent(new Event(event));
}
