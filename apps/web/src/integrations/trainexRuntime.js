
import { createEngine } from "@trainex/simulation-engine";
import { createInputManager } from "@trainex/input-manager";

import {
  registerTrainexRuntime,
} from "./trainexClient.js";

let installation = null;

export function initializeTrainexRuntime() {
  if (installation) {
    return installation;
  }

  // One authoritative engine instance.
  const engine = createEngine({
    autoTick: true,
  });

  // All operating commands pass through this manager.
  const inputManager = createInputManager({
    dispatchCommand: (command) =>
      engine.sendCommand(command),

    getSessionId: () =>
      engine.getSessionInfo().sessionId,
  });

  const runtime = {
    getState() {
      return engine.getState();
    },

    subscribe(listener) {
      return engine.subscribe(listener);
    },

    getSessionStatus() {
      return engine.getSessionStatus();
    },

    getSessionInfo() {
      return engine.getSessionInfo();
    },

    sendCommand(command) {
      return inputManager.submit(command);
    },

    startSession(options = {}) {
      inputManager.resetSequenceHistory();
      return engine.startSession(options);
    },

    pauseSession() {
      return engine.pauseSession();
    },

    resumeSession() {
      return engine.resumeSession();
    },

    resetSession() {
      inputManager.resetSequenceHistory();
      return engine.resetSession();
    },

    endSession() {
      return engine.endSession();
    },

    destroy() {
      engine.destroy();
    },
  };

  const unregister = registerTrainexRuntime(runtime);

  installation = {
    engine,
    inputManager,
    runtime,

    dispose() {
      if (installation !== this) return;

      unregister();
      engine.destroy();
      installation = null;
    },
  };

  return installation;
}

// Clean up if Vite replaces this module during development.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    installation?.dispose();
  });
}
