export const on = (event: number, listener: (detail: any) => void) => {
  const eventName = String(event);
  document.addEventListener(eventName, (e: Event) => {
    console.log('on', event, e);
    listener((e as CustomEvent).detail);
  });
};

export const emit = (event: number, data?: any) => {
  console.log('emit', event, data);
  
  const eventName = String(event);
  document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
};
