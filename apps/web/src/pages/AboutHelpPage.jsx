
import PageHeader from "../components/common/PageHeader.jsx";

export default function AboutHelpPage() {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="ABOUT / HELP"
        title="About TRAINEX"
        description="A browser-based railway driver training platform focused on core driver console operation and railway education."
      />

      <div className="card-grid two-cols align-start">
        <section className="panel card-stack">
          <h2>Getting started</h2>

          <ol className="steps">
            <li>
              Choose a 2D or 3D simulator workspace.
            </li>

            <li>
              Connect the independent simulation
              runtime when available.
            </li>

            <li>
              Start a simulation session and
              operate the supported controls.
            </li>

            <li>
              Use Learning Materials and
              the Glossary for context.
            </li>
          </ol>
        </section>

        <section className="panel card-stack">
          <h2>Browser compatibility</h2>

          <p>
            TRAINEX targets modern desktop and
            mobile browsers. 2D controls should
            support touch; 3D performance depends
            on the device. Audio may require
            user interaction.
          </p>

          <p>
            Hardware over the internet uses a
            secure WebSocket relay. Direct USB
            Serial is limited to supported desktop
            browsers and is not implemented in
            this initial frontend scaffold.
          </p>
        </section>
      </div>

      <section className="panel callout">
        <h2>Educational use only</h2>

        <p>
          TRAINEX represents a simplified
          training simulation and is not an
          operational railway control system.
        </p>
      </section>
    </div>
  );
}
