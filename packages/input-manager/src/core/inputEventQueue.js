// One command at a time, preserving submission order even for async adapters.
export function createInputEventQueue() {
  let tail = Promise.resolve();
  return {
    enqueue(task) {
      const pending = tail.then(task, task);
      tail = pending.catch(() => {});
      return pending;
    },
  };
}
