export const on = (event: string, listener: (detail: any) => void) => {
  document.addEventListener(event, (e: Event) => {
    console.log('event', event, e);
    listener((e as CustomEvent).detail);
  });
};

export const emit = (event: string, data?: any) => {
  document.dispatchEvent(new CustomEvent(event, { detail: data }));
};
