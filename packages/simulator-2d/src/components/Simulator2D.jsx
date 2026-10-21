
import DriverConsole from "./DriverConsole.jsx";

import ComponentInfoPanel from "./explorer/ComponentInfoPanel.jsx";

import InternalStructureDiagram from "./diagrams/InternalStructureDiagram.jsx";

import {
  getConsoleState,
} from "../config/consoleLayout.js";

import {
  use2DControls,
} from "../hooks/use2DControls.js";

import {
  useComponentSelection,
} from "../hooks/useComponentSelection.js";

export default function Simulator2D({
  trainState = null,
  sendInput,
  ready = false,
  sessionId,
}) {
  const state = getConsoleState(trainState);

  const canOperate =
    ready && typeof sendInput === "function";

  const controls = use2DControls({
    sendInput,
    sessionId,
    ready: canOperate,
  });

  const {
    selectedId,
    selectComponent,
  } = useComponentSelection();

  return (
    <section
      className="trainex-2d"
      aria-label="TRAINEX 2D Driver Simulator"
    >
      <header className="c2d-app-header">
        <div>
          <span className="c2d-eyebrow">
            TRAINEX / INTERACTIVE SIMULATION
          </span>

          <h2>Driver's Console</h2>

          <p>
            Explore, inspect, and operate
            supported railway driver controls.
          </p>
        </div>

        <div
          className={`c2d-engine-badge ${
            canOperate ? "is-ready" : ""
          }`}
        >
          <span className="c2d-status-dot" />

          {canOperate
            ? "ENGINE CONNECTED"
            : "ENGINE UNAVAILABLE"}
        </div>
      </header>

      <div className="c2d-workspace">
        <div className="c2d-main-workspace">
          <DriverConsole
            state={state}
            disabled={!canOperate}
            controls={controls}
            onInspect={selectComponent}
          />

          {!canOperate && (
            <p className="c2d-notice">
              Interface preview only.
              Connect the TRAINEX simulation runtime
              to enable operating controls.
            </p>
          )}

          <p
            className="c2d-feedback"
            role="status"
            aria-live="polite"
          >
            {controls.feedback}
          </p>
        </div>

        <aside className="c2d-sidebar">
          <ComponentInfoPanel
            selectedId={selectedId}
            onSelect={selectComponent}
          />

          <InternalStructureDiagram />
        </aside>
      </div>
    </section>
  );
}
