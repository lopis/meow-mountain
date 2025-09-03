export const on = (event: number, listener: (detail: any) => void) => {
  const eventName = String(event);
  document.addEventListener(eventName, (e: Event) => {
    listener((e as CustomEvent).detail);
  });
};

export const emit = (event: number, data?: any) => {
  const eventName = String(event);
  console.log('event', eventName, data);
  document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
};
