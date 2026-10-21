
import {
  COMPONENT_IDS,
} from "../../config/consoleLayout.js";

export default function FrontDisplayPanel({
  state,
  onInspect,
}) {
  const speed = Number.isFinite(state.speed)
    ? state.speed.toFixed(1)
    : "—";

  const emergency =
    state.emergencyBrake === null
      ? "UNAVAILABLE"
      : state.emergencyBrake
        ? "ACTIVE"
        : "CLEAR";

  return (
    <section className="c2d-module c2d-display-module">
      <header className="c2d-module-header">
        <span>FRONT DISPLAY PANEL</span>

        <button
          type="button"
          className="c2d-inspect"
          onClick={() =>
            onInspect(COMPONENT_IDS.DISPLAY)
          }
          aria-label="Inspect Front Display Panel"
        >
          i
        </button>
      </header>

      <div className="c2d-screen">
        <div className="c2d-screen-heading">
          <strong>TRAINEX</strong>
          <span>OPERATING INDICATIONS</span>
        </div>

        <div className="c2d-speed-area">
          <div>
            <small>TRAIN SPEED</small>

            <div className="c2d-speed-value">
              <output>{speed}</output>
              <span>km/h</span>
            </div>
          </div>

          <span className="c2d-screen-label">
            SIMULATED
          </span>
        </div>

        <div className="c2d-screen-metrics">
          <div>
            <small>MASTER HANDLE</small>

            <strong>
              {state.masterHandle ?? "—"}
            </strong>
          </div>

          <div>
            <small>PASSENGER DOORS</small>

            <strong>{state.doorState}</strong>
          </div>

          <div>
            <small>EMERGENCY BRAKE</small>

            <strong
              className={
                state.emergencyBrake
                  ? "c2d-screen-alert"
                  : ""
              }
            >
              {emergency}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
