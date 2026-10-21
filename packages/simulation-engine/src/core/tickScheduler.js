// Browser and Node-compatible clock; autoTick is optional for deterministic tests.
export function createTickScheduler(onTick, { intervalMs = 50, now = () => performance.now() } = {}) {
  let timer = null;
  let last = 0;
  return {
    start() {
      if (timer !== null) return;
      last = now();
      timer = setInterval(() => {
        const current = now();
        // Clamp wall-clock gaps when tabs wake from background throttling.
        const delta = Math.max(0, Math.min(0.25, (current - last) / 1000));
        last = current;
        if (delta > 0) onTick(delta);
      }, intervalMs);
    },
    stop() {
      if (timer !== null) clearInterval(timer);
      timer = null;
    },
    isRunning: () => timer !== null,
  };
}
