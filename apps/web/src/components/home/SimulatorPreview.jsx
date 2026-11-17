import Button from "../common/Button.jsx";

const controls = [
  "Train Management System Panel",
  "Master Control Handle",
  "Horn Button",
  "Vigilance Button",
  "Passenger Door Controls",
  "Security Brake Button",
  "Emergency  Brake Button"
];

export default function SimulatorPreview() {
  return (
    <section className="section split-section">
      <div>
        <h2>Built around NSCR Commuter Train Driver Cabin Controls </h2>

        <p className="eyebrow">FUNCTIONAL DRIVER CAB COMPONENTS</p>

        <p className="lead">
          The Master Control Handle (MCH), Emergency Brake and Security Brake Button,
          Passenger Door Controls and Indicators, Vigilance Acknowledgement Button 
          and Indicators, Horn Button, Speakers, and The Train Management System Panel
          form the initial simulation scope.
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
