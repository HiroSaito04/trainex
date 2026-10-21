// Stable external-store facade for React useSyncExternalStore.
// Register an engine runtime once from main.jsx; preserve it across route changes.
let runtime = null;
let unsubscribeRuntime = null;
const listeners = new Set();

const initialTrainState = Object.freeze({
  speed: 0, masterHandle: 'COAST', doorState: 'CLOSED',
  allDoorsClosed: true, emergencyBrake: false,
});
let snapshot = Object.freeze({
  state: initialTrainState, trainState: initialTrainState,
  sessionStatus: 'IDLE', sessionId: null, ready: false,
});

function refresh() {
  const trainState = runtime?.getState?.() ?? initialTrainState;
  const sessionStatus = runtime?.getSessionStatus?.() ?? 'IDLE';
  const sessionId = runtime?.getSessionInfo?.()?.sessionId ?? trainState.sessionId ?? null;
  if (snapshot.trainState === trainState && snapshot.sessionStatus === sessionStatus && snapshot.sessionId === sessionId)
    return;
  snapshot = Object.freeze({
    state: trainState,
    trainState,
    sessionStatus,
    sessionId,
    ready: sessionStatus === 'RUNNING',
  });
  for (const listener of [...listeners]) listener();
}

export function registerTrainexRuntime(nextRuntime) {
  unsubscribeRuntime?.();
  unsubscribeRuntime = null;
  runtime = nextRuntime ?? null;
  if (runtime) {
    if (typeof runtime.subscribe !== 'function' || typeof runtime.getState !== 'function')
      throw new Error('Runtime must implement getState and subscribe.');
    unsubscribeRuntime = runtime.subscribe(refresh);
  }
  refresh();
  return () => {
    if (runtime === nextRuntime) registerTrainexRuntime(null);
  };
}

export function subscribeTrainex(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getTrainexSnapshot() { return snapshot; }
export function getTrainexRuntime() { return runtime; }

const unavailable = () => ({ accepted: false, reason: 'Train Simulation Engine is unavailable.' });
export function sendTrainexInput(event) { return runtime?.sendCommand?.(event) ?? Promise.resolve(unavailable()); }
export function startTrainexSession(options) { return runtime?.startSession?.(options) ?? unavailable(); }
export function pauseTrainexSession() { return runtime?.pauseSession?.() ?? unavailable(); }
export function resumeTrainexSession() { return runtime?.resumeSession?.() ?? unavailable(); }
export function resetTrainexSession() { return runtime?.resetSession?.() ?? unavailable(); }
export function endTrainexSession() { return runtime?.endSession?.() ?? unavailable(); }
