
import {
  COMPONENT_IDS,
} from "../../config/consoleLayout.js";

export default function AllDoorsClosedLamp({
  allDoorsClosed,
  onInspect,
}) {
  const confirmed = allDoorsClosed === true;

  const label =
    allDoorsClosed === null
      ? "UNAVAILABLE"
      : confirmed
        ? "CONFIRMED CLOSED"
        : "NOT CONFIRMED";

  return (
    <section className="c2d-module c2d-lamp-module">
      <header className="c2d-module-header">
        <span>DOOR INDICATION</span>

        <button
          type="button"
          className="c2d-inspect"
          onClick={() =>
            onInspect(COMPONENT_IDS.DOOR_LAMP)
          }
          aria-label="Inspect All Doors Closed Lamp"
        >
          i
        </button>
      </header>

      <div className="c2d-lamp-body">
        <p>ALL DOORS CLOSED</p>

        <div
          className={`c2d-lamp ${
            confirmed ? "is-on" : ""
          }`}
          role="img"
          aria-label={`All Doors Closed lamp: ${label}`}
          data-testid="door-lamp"
        />

        <output
          className={
            confirmed ? "c2d-lamp-confirmed" : ""
          }
        >
          {label}
        </output>
      </div>
    </section>
  );
}
