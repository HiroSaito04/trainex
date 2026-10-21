
let runtime = null;
let unsubscribeRuntime = null;

const listeners = new Set();

const unavailableState = Object.freeze({
  speed: null,
  masterHandle: null,
  doorState: "UNAVAILABLE",
  allDoorsClosed: null,
  emergencyBrake: null,
});

let snapshot = Object.freeze({
  state: unavailableState,
  trainState: unavailableState,
  sessionStatus: "IDLE",
  sessionId: null,
  ready: false,
});

function notifyListeners() {
  for (const listener of [...listeners]) {
    listener();
  }
}

function refreshSnapshot() {
  const trainState =
    runtime?.getState?.() ?? unavailableState;

  const sessionStatus =
    runtime?.getSessionStatus?.() ?? "IDLE";

  const sessionId =
    runtime?.getSessionInfo?.()?.sessionId ??
    trainState.sessionId ??
    null;

  // Avoid unnecessary React rerenders.
  if (
    snapshot.trainState === trainState &&
    snapshot.sessionStatus === sessionStatus &&
    snapshot.sessionId === sessionId
  ) {
    return;
  }

  snapshot = Object.freeze({
    state: trainState,
    trainState,
    sessionStatus,
    sessionId,
    ready: sessionStatus === "RUNNING",
  });

  notifyListeners();
}

// Register one shared simulation runtime.
export function registerTrainexRuntime(nextRuntime) {
  if (nextRuntime != null) {
    if (
      typeof nextRuntime.getState !== "function" ||
      typeof nextRuntime.subscribe !== "function"
    ) {
      throw new Error(
        "TRAINEX runtime must implement getState and subscribe."
      );
    }
  }

  unsubscribeRuntime?.();
  unsubscribeRuntime = null;

  runtime = nextRuntime ?? null;

  if (runtime) {
    unsubscribeRuntime = runtime.subscribe(
      refreshSnapshot
    );
  }

  refreshSnapshot();

  return () => {
    if (runtime === nextRuntime) {
      registerTrainexRuntime(null);
    }
  };
}

// React external-store interface.
export function subscribeTrainex(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getTrainexSnapshot() {
  return snapshot;
}

export function getTrainexRuntime() {
  return runtime;
}

export function getTrainexState() {
  return snapshot.trainState;
}

export function getTrainexSessionStatus() {
  return snapshot.sessionStatus;
}

// Standard rejection response.
function unavailable() {
  return {
    accepted: false,
    reason: "Train Simulation Engine is unavailable.",
  };
}

// Centralized Input Manager entry point.
export function sendTrainexInput(event) {
  if (!runtime?.sendCommand) {
    return Promise.resolve(unavailable());
  }

  return runtime.sendCommand(event);
}

// Compatibility aliases for other website modules.
export const sendTrainexCommand = sendTrainexInput;
export const sendCommand = sendTrainexInput;

// Session management.
export function startTrainexSession(options = {}) {
  return runtime?.startSession?.(options) ??
    unavailable();
}

export function pauseTrainexSession() {
  return runtime?.pauseSession?.() ??
    unavailable();
}

export function resumeTrainexSession() {
  return runtime?.resumeSession?.() ??
    unavailable();
}

export function resetTrainexSession() {
  return runtime?.resetSession?.() ??
    unavailable();
}

export function endTrainexSession() {
  return runtime?.endSession?.() ??
    unavailable();
}

// Short aliases for existing integrations.
export const startSession = startTrainexSession;
export const pauseSession = pauseTrainexSession;
export const resumeSession = resumeTrainexSession;
export const resetSession = resetTrainexSession;
export const endSession = endTrainexSession;
