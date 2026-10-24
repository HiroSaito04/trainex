import "../assets/styles/pages/simulation.css";

import Button from "../components/common/Button.jsx";

import PageHeader from "../components/common/PageHeader.jsx";

export default function SimulatorsPage() {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="SIMULATORS"
        title="Choose your driver cabin"
        description="Both interfaces will eventually connect to the same authoritative Train Simulation Engine."
      />

      <div className="card-grid two-cols">
        <article className="panel card-stack">
          <div className="feature-icon">
            ▦
          </div>

          <h2>2D Driver Controls</h2>

          <p>
            A clear, touchscreen-friendly view
            of the required console elements
            and operating indicators.
          </p>

          <Button to="/simulators/2d">
            Open 2D Workspace →
          </Button>
        </article>

        <article className="panel card-stack">
          <div className="feature-icon">
            ⬡
          </div>

          <h2>3D Driver Cabin</h2>

          <p>
            A future Three.js scene with
            Blender-exported GLB assets,
            first-person inspection, and
            interactive controls.
          </p>

          <Button to="/simulators/3d">
            Open 3D Workspace →
          </Button>
        </article>
      </div>
    </div>
  );
}
