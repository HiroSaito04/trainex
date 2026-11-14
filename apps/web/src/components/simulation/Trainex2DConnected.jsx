import { audioService } from "../../services/audioService.js";
import "./Trainex2DConnected.css";
import { useEffect, useSyncExternalStore } from "react";
import { Simulator2D } from "@trainex/simulator-2d";
import {
  subscribeTrainex,
  getTrainexSnapshot,
  sendTrainexInput,
  startTrainexSession,
  pauseTrainexSession,
  resumeTrainexSession,
  resetTrainexSession,
  endTrainexSession,
} from "../../integrations/trainexClient.js";

/** Web adapter: all actions use the existing shared TRAINEX runtime. */
const sessionActions = Object.freeze({
  start: (...args) => {
    void audioService.enable().catch(() => {});
    return startTrainexSession(...args);
  },
  pause: pauseTrainexSession,
  resume: (...args) => {
    void audioService.enable().catch(() => {});
    return resumeTrainexSession(...args);
  },
  reset: resetTrainexSession,
  end: endTrainexSession,
});
export default function Trainex2DConnected({ svgUrl }) {
  const snapshot = useSyncExternalStore(
    subscribeTrainex,
    getTrainexSnapshot,
    getTrainexSnapshot,
  );
  useEffect(() => {
    audioService.setVigilanceAlert(
      snapshot.ready && snapshot.trainState?.vigilanceBuzzer === true,
    );
    return () => audioService.setVigilanceAlert(false);
  }, [snapshot.ready, snapshot.trainState?.vigilanceBuzzer]);
  return (
    <div className="t2d-connected">
      <Simulator2D
        trainState={snapshot.trainState}
        ready={snapshot.ready}
        sessionId={snapshot.sessionId}
        sessionStatus={snapshot.sessionStatus}
        sessionActions={sessionActions}
        svgUrl={svgUrl}
        sendInput={sendTrainexInput}
      />
    </div>
  );
}
