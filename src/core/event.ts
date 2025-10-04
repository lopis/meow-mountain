const listeners: Array<{ eventName: string; handler: EventListener }> = [];

export const on = (event: number, listener: (detail: any) => void) => {
  const eventName = String(event);
  const handler = (e: Event) => {
    listener((e as CustomEvent).detail);
  };
  document.addEventListener(eventName, handler);
  listeners.push({ eventName, handler });
};

export const emit = (event: number, data?: any) => {
  const eventName = String(event);
  document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
};

export const clearEvents = () => {
  for (const { eventName, handler } of listeners) {
    document.removeEventListener(eventName, handler);
  }
  listeners.length = 0;
};
