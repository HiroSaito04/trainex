
import {
  COMPONENT_IDS,
} from "../../config/consoleLayout.js";

export default function EmergencyBrakeSwitch({
  active,
  disabled,
  onActivate,
  onReset,
  onInspect,
}) {
  return (
    <section className="c2d-module c2d-emergency">
      <header className="c2d-module-header">
        <span>EMERGENCY BRAKE</span>

        <button
          type="button"
          className="c2d-inspect"
          onClick={() =>
            onInspect(COMPONENT_IDS.EMERGENCY)
          }
          aria-label="Inspect Emergency Brake Switch"
        >
          i
        </button>
      </header>

      <div className="c2d-emergency-body">
        <button
          type="button"
          className={`c2d-emergency-button ${
            active ? "is-engaged" : ""
          }`}
          disabled={disabled || active === true}
          aria-label="Activate emergency brake"
          onClick={onActivate}
        >
          <span>
            {active ? "ACTIVE" : "STOP"}
          </span>
        </button>

        <output
          className={`c2d-emergency-status ${
            active ? "is-engaged" : ""
          }`}
        >
          {active === null
            ? "STATE UNAVAILABLE"
            : active
              ? "EMERGENCY ACTIVE"
              : "STANDBY"}
        </output>

        <button
          type="button"
          className="c2d-reset-button"
          disabled={disabled || active !== true}
          onClick={onReset}
        >
          Request Reset
        </button>
      </div>
    </section>
  );
}
