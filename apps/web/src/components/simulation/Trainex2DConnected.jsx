
import {
  useState,
  useSyncExternalStore,
} from "react";

import {
  Simulator2D,
} from "@trainex/simulator-2d";

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

function SessionControls({ status }) {
  const [message, setMessage] = useState("");

  function execute(operation) {
    try {
      const result = operation();

      if (result?.accepted === false) {
        setMessage(
          result.reason ?? "Operation rejected."
        );
        return;
      }

      setMessage("");
    } catch (error) {
      setMessage(
        error?.message ?? "Session operation failed."
      );
    }
  }

  const canStart =
    status === "IDLE" ||
    status === "ENDED";

  const canPause =
    status === "RUNNING";

  const canResume =
    status === "PAUSED";

  const hasSession =
    status === "RUNNING" ||
    status === "PAUSED";

  return (
    <div className="panel toolbar">
      <div
        className="toolbar-actions"
        role="group"
        aria-label="Simulation session controls"
      >
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canStart}
          onClick={() =>
            execute(startTrainexSession)
          }
        >
          Start
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={!canPause}
          onClick={() =>
            execute(pauseTrainexSession)
          }
        >
          Pause
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={!canResume}
          onClick={() =>
            execute(resumeTrainexSession)
          }
        >
          Resume
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          disabled={!hasSession}
          onClick={() =>
            execute(resetTrainexSession)
          }
        >
          Reset
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          disabled={!hasSession}
          onClick={() =>
            execute(endTrainexSession)
          }
        >
          End
        </button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="text-muted"
        style={{
          margin: "0.75rem 0 0",
          fontSize: "0.82rem",
        }}
      >
        {message || `Session: ${status}`}
      </p>
    </div>
  );
}

export default function Trainex2DConnected({
  showSessionControls = true,
}) {
  const snapshot = useSyncExternalStore(
    subscribeTrainex,
    getTrainexSnapshot,
    getTrainexSnapshot
  );

  return (
    <div className="trainex-2d-connected">
      {showSessionControls && (
        <SessionControls
          status={snapshot.sessionStatus}
        />
      )}

      <Simulator2D
        trainState={snapshot.trainState}
        ready={snapshot.ready}
        sessionId={
          snapshot.sessionId ?? undefined
        }
        sendInput={sendTrainexInput}
      />
    </div>
  );
}
