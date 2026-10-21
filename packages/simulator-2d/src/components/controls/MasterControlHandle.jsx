
import {
  HANDLE_POSITIONS,
  COMPONENT_IDS,
} from "../../config/consoleLayout.js";

import {
  handleMasterKeyDown,
} from "../../interactions/keyboardHandlers.js";

const angles = { EB: -40, B3: -30, B2: -20, B1: -10, N: 0, P1: 12, P2: 24, P3: 36 };

export default function MasterControlHandle({
  value,
  disabled,
  onChange,
  onInspect,
}) {
  const angle = angles[value] ?? 0;

  return (
    <section className="c2d-module c2d-master">
      <header className="c2d-module-header">
        <span>MASTER CONTROL HANDLE</span>

        <button
          type="button"
          className="c2d-inspect"
          onClick={() =>
            onInspect(COMPONENT_IDS.MASTER)
          }
          aria-label="Inspect Master Control Handle"
        >
          i
        </button>
      </header>

      <div className="c2d-lever-housing">
        <div className="c2d-lever-scale">
          {HANDLE_POSITIONS.map(position => (
            <span key={position}>{position}</span>
          ))}
        </div>

        <div className="c2d-lever-stage">
          <div
            className="c2d-lever"
            style={{
              transform: `rotate(${angle}deg)`,
            }}
            aria-hidden="true"
          >
            <span className="c2d-lever-grip" />
            <span className="c2d-lever-shaft" />
          </div>

          <div className="c2d-lever-pivot" />
        </div>

        <output className="c2d-handle-readout">
          {value ?? "UNAVAILABLE"}
        </output>
      </div>

      <div
        className="c2d-detents"
        role="group"
        aria-label="Master handle positions"
      >
        {HANDLE_POSITIONS.map((position) => (
          <button
            key={position}
            type="button"
            className={`c2d-detent ${position === "EB" ? "is-emergency" : ""} ${
              value === position ? "is-active" : ""
            }`}
            aria-pressed={value === position}
            disabled={disabled}
            onClick={() => onChange(position)}
            onKeyDown={(event) =>
              handleMasterKeyDown(
                event,
                value,
                onChange
              )
            }
          >
            {position}
          </button>
        ))}
      </div>
    </section>
  );
}
