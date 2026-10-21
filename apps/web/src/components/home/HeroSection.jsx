
import Button from "../common/Button.jsx";

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">
          INTERACTIVE RAILWAY TRAINING PLATFORM
        </p>

        <h1>
          Learn railway controls.
          <br />
          <span className="accent-text">
            Explore the driver's cab.
          </span>
        </h1>

        <p className="lead">
          TRAINEX brings together interactive 3D 
          cabin interfaces, guided learning,
          and optional physical controls in one
          browser-based platform.
        </p>

        <div className="action-row">
          <Button to="/simulators">
            Explore Simulators →
          </Button>

          <Button
            to="/learn"
            variant="secondary"
          >
            Learning Materials
          </Button>
        </div>
      </div>

      <div
        className="hero-visual"
        role="img"
        aria-label="Stylized abstract driver console preview"
      >
        <span className="visual-label">
          TRAINEX
        </span>

        <div className="visual-display">
          <span className="display-indicator" />

          <strong>
            TRAIN DRIVER CABIN
          </strong>
        </div>

        <div className="visual-controls">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>

        <span className="visual-note">
          LEARN DRIVER OPERATIONS
        </span>
      </div>
    </section>
  );
}
