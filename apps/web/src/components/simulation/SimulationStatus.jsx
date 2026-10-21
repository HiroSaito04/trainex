import { useTrainState } from "../../context/useTrainState.js";

export default function SimulationStatus() {
  const { trainState, sessionStatus } = useTrainState();
  const display = trainState?.display ?? trainState ?? {};
  const activeSession = sessionStatus === "RUNNING" || sessionStatus === "PAUSED";

  return (
    <aside className="panel status-panel" aria-live="polite">
      <div className="section-heading">
        <p className="eyebrow">LIVE MONITOR</p>
        <h2>Train Status</h2>
      </div>
      {!activeSession && (
        <p className="notice">Start a simulation session to view active operating indications.</p>
      )}
      {sessionStatus === "PAUSED" && (
        <p className="notice">Simulation paused. Values are preserved; controls are disabled.</p>
      )}
      <div className="metric-grid">
        <div className="metric">
          <span>Speed</span>
          <strong>{activeSession && Number.isFinite(display.speed)
            ? `${display.speed.toFixed(1)} km/h` : "—"}</strong>
        </div>
        <div className="metric">
          <span>Master Handle</span>
          <strong>{activeSession ? String(display.masterHandle ?? "—") : "—"}</strong>
        </div>
        <div className="metric">
          <span>Passenger Doors</span>
          <strong>{activeSession ? String(display.doorState ?? display.doors ?? "—") : "—"}</strong>
        </div>
        <div className="metric">
          <span>All Doors Closed</span>
          <strong>{activeSession && typeof display.allDoorsClosed === "boolean"
            ? display.allDoorsClosed ? "Yes" : "No" : "—"}</strong>
        </div>
        <div className="metric">
          <span>Emergency Brake</span>
          <strong>{activeSession && typeof display.emergencyBrake === "boolean"
            ? display.emergencyBrake ? "Active" : "Clear" : "—"}</strong>
        </div>
        <div className="metric">
          <span>Session</span>
          <strong>{sessionStatus}</strong>
        </div>
      </div>
    </aside>
  );
}
