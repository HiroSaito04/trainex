import Button from "../common/Button.jsx";

const controls = [
  "Train Management System Panel",
  "Master Control Handle",
  "Horn Button",
  "Vigilance Button",
  "Passenger Door Controls",
  "Security Brake Button",
];

export default function SimulatorPreview() {
  return (
    <section className="section split-section">
      <div>
        <h2>Built around NSCR Commuter Train Driver Cabin Controls </h2>

        <p className="eyebrow">FUNCTIONAL DRIVER CAB COMPONENTS</p>

        <p className="lead">
          The Train Management System Panel, All Doors Closed Lamp, 
          All Doors Open Lamp, Speedometer, Master Control Handle,
          Horn Button, Vigilance Button and Lamp, Security Brake Button,
          and Passenger Door Controls form the initial
          simulation scope.
        </p>

      </div>

      <div className="panel list-panel">
        {controls.map((name, index) => (
          <div className="numbered-row" key={name}>
            <span>{String(index + 1).padStart(2, "0")}</span>

            <strong>{name}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
