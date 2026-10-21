
import Button from "../common/Button.jsx";

const controls = [
  "Front Display Panel",
  "All Doors Closed Lamp",
  "Master Control Handle",
  "Emergency Brake Switch",
  "Passenger Door Controls",
];

export default function SimulatorPreview() {
  return (
    <section className="section split-section">
      <div>
        <p className="eyebrow">
          FIVE ESSENTIAL CONSOLE ELEMENTS
        </p>

        <h2>
          Built around functional railway controls
        </h2>

        <p className="lead">
          The Front Display Panel, All Doors Closed
          lamp, Master Control Handle, Emergency
          Brake Switch, and Passenger Door Controls
          form the initial simulation scope.
        </p>

        <Button
          to="/simulators"
          variant="secondary"
        >
          View simulator options
        </Button>
      </div>

      <div className="panel list-panel">
        {controls.map((name, index) => (
          <div
            className="numbered-row"
            key={name}
          >
            <span>
              {String(index + 1).padStart(2, "0")}
            </span>

            <strong>{name}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
