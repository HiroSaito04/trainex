import {
  startTrainexSession,
  pauseTrainexSession,
  resumeTrainexSession,
  resetTrainexSession,
  endTrainexSession,
} from "../integrations/trainexClient.js";

// Website orchestration only: engine remains authoritative.
export const sessionCoordinator = Object.freeze({
  start: startTrainexSession,
  pause: pauseTrainexSession,
  resume: resumeTrainexSession,
  reset: resetTrainexSession,
  end: endTrainexSession,
});
