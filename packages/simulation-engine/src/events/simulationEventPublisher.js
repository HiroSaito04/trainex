export function createSimulationEventPublisher() {
  const listeners = new Set();
  return {
    emit(event) {
      const immutableEvent = Object.freeze({ ...event });
      for (const listener of [...listeners]) listener(immutableEvent);
      return immutableEvent;
    },
    subscribe(listener) {
      if (typeof listener !== 'function') throw new TypeError('Listener must be a function');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
