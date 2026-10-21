
import {
  COMPONENT_IDS,
} from "../../config/consoleLayout.js";

export default function PassengerDoorControls({
  doorState,
  disabled,
  onOpen,
  onClose,
  onInspect,
}) {
  const transitioning =
    doorState === "OPENING" ||
    doorState === "CLOSING";

  return (
    <section className="c2d-module c2d-doors">
      <header className="c2d-module-header">
        <span>PASSENGER DOORS</span>

        <button
          type="button"
          className="c2d-inspect"
          onClick={() =>
            onInspect(COMPONENT_IDS.DOORS)
          }
          aria-label="Inspect Passenger Door Controls"
        >
          i
        </button>
      </header>

      <div className="c2d-door-display">
        <div
          className={`c2d-door-symbol ${
            doorState === "OPEN" ? "is-open" : ""
          }`}
          aria-hidden="true"
        >
          <span />
          <span />
        </div>

        <div>
          <small>DOOR CONDITION</small>
          <strong>{doorState}</strong>
        </div>
      </div>

      <div className="c2d-door-buttons">
        <button
          type="button"
          className="c2d-door-action"
          disabled={
            disabled ||
            transitioning ||
            doorState === "OPEN"
          }
          onClick={onOpen}
        >
          <span aria-hidden="true">↔</span>
          OPEN DOORS
        </button>

        <button
          type="button"
          className="c2d-door-action"
          disabled={
            disabled ||
            transitioning ||
            doorState === "CLOSED"
          }
          onClick={onClose}
        >
          <span aria-hidden="true">→←</span>
          CLOSE DOORS
        </button>
      </div>

      <p className="c2d-control-hint">
        Door movement and audible indications
        are controlled by the simulation engine.
      </p>
    </section>
  );
}
