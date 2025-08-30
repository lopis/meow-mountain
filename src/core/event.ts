export const on = (event: string, listener: (detail: any) => void) => {
  document.addEventListener(event, (e: Event) => {
    listener((e as CustomEvent).detail);
  });
};

export const emit = (event: string, data?: any) => {
  console.log('event', event, data);
  document.dispatchEvent(new CustomEvent(event, { detail: data }));
};
