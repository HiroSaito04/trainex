import { createEngine } from '@trainex/simulation-engine';
import { createInputManager } from '@trainex/input-manager';
import { registerTrainexRuntime } from './trainexClient.js';

let installed = null;

// Call once from main.jsx BEFORE createRoot(...).render(...).
export function initializeTrainexRuntime() {
  if (installed) return installed;
  const engine = createEngine({ autoTick: true });
  const inputs = createInputManager({
    dispatchCommand: command => engine.sendCommand(command),
    getSessionId: () => engine.getSessionInfo().sessionId,
  });

  const runtime = {
    getState: () => engine.getState(),
    subscribe: callback => engine.subscribe(callback),
    getSessionInfo: () => engine.getSessionInfo(),
    getSessionStatus: () => engine.getSessionStatus(),
    sendCommand: command => inputs.submit(command),
    startSession: options => engine.startSession(options),
    pauseSession: () => engine.pauseSession(),
    resumeSession: () => engine.resumeSession(),
    resetSession: () => engine.resetSession(),
    endSession: () => engine.endSession(),
    destroy: () => engine.destroy(),
  };
  const unregister = registerTrainexRuntime(runtime);
  installed = {
    engine, inputs, runtime,
    dispose() {
      unregister(); engine.destroy(); installed = null;
    },
  };
  return installed;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => installed?.dispose());
}
