import { useState } from "react";
import Button from "../common/Button.jsx";
import { useTrainState } from "../../context/useTrainState.js";
import { sessionCoordinator } from "../../services/sessionCoordinator.js";
import { audioService } from "../../services/audioService.js";

export default function SessionToolbar() {
  const { sessionStatus } = useTrainState();
  const [error, setError] = useState("");
  const [audio, setAudio] = useState(audioService.isEnabled());

  const running = sessionStatus === "RUNNING";
  const paused = sessionStatus === "PAUSED";
  const hasSession = running || paused;

  async function act(operation) {
    try {
      setError("");
      const result = await operation();
      if (result?.accepted !== true) {
        setError(result?.reason ?? "Session operation was rejected.");
      }
    } catch (error) {
      setError(error?.message ?? "Session operation failed.");
    }
  }

  async function toggleAudio() {
    try {
      setError("");
      if (audio) {
        audioService.mute();
        setAudio(false);
      } else {
        await audioService.enable();
        setAudio(true);
        await audioService.playTestTone();
      }
    } catch (error) {
      setError(error?.message ?? "Audio operation failed.");
    }
  }

  return (
    <div className="panel toolbar">
      <div className="toolbar-actions" role="group" aria-label="Simulation session controls">
        <Button
          onClick={() => act(sessionCoordinator.start)}
          disabled={hasSession}
        >
          Start
        </Button>
        <Button
          variant="secondary"
          onClick={() => act(running ? sessionCoordinator.pause : sessionCoordinator.resume)}
          disabled={!hasSession}
        >
          {running ? "Pause" : "Resume"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => act(sessionCoordinator.reset)}
          disabled={!hasSession}
        >
          Reset
        </Button>
        <Button
          variant="ghost"
          onClick={() => act(sessionCoordinator.end)}
          disabled={!hasSession}
        >
          End
        </Button>
        <Button variant="secondary" onClick={toggleAudio}>
          {audio ? "Mute Audio" : "Enable Audio"}
        </Button>
      </div>
      <p role="status" aria-live="polite" className="text-muted">
        Session: {sessionStatus}
      </p>
      {error && <p className="feedback-error" role="alert">{error}</p>}
    </div>
  );
}
