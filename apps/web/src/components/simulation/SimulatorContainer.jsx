import { getSimulator2D } from "../../integrations/simulator2DAdapter.js";
import { getSimulator3D } from "../../integrations/simulator3DAdapter.js";
import { useTrainState } from "../../context/useTrainState.js";
import { sendInput } from "../../integrations/inputAdapter.js";

export default function SimulatorContainer({ mode }) {
  const { trainState, ready, sessionId } = useTrainState();
  const Component = mode === "2d" ? getSimulator2D() : getSimulator3D();

  return (
    <section
      className={`panel simulator-canvas simulator-canvas-${mode}`}
      aria-label={`${mode.toUpperCase()} simulator workspace`}
    >
      {Component ? (
        <Component
          trainState={trainState}
          sendInput={sendInput}
          ready={ready}
          sessionId={sessionId ?? undefined}
        />
      ) : (
        <div className="empty-state">
          <div className="empty-illustration" aria-hidden="true">
            {mode === "2d" ? "▦" : "⬡"}
          </div>
          <p className="eyebrow">{mode.toUpperCase()} SIMULATOR WORKSPACE</p>
          <h2>{mode === "2d" ? "2D Driver Console" : "3D Driver Cabin"}</h2>
          <p>
            The independent {mode.toUpperCase()} simulator module is not yet
            registered. Engine state and session controls are shared across routes.
          </p>
        </div>
      )}
    </section>
  );
}
