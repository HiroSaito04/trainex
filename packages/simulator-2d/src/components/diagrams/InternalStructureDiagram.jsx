
export default function InternalStructureDiagram() {
  return (
    <section className="c2d-info-card">
      <div className="c2d-info-heading">
        <span className="c2d-eyebrow">
          SYSTEM OVERVIEW
        </span>

        <h3>Control Relationships</h3>
      </div>

      <svg
        viewBox="0 0 480 245"
        className="c2d-diagram"
        role="img"
        aria-labelledby="c2d-diagram-title"
      >
        <title id="c2d-diagram-title">
          Virtual controls send commands through the
          input manager to the train simulation
          engine, which updates indicators.
        </title>

        <g className="c2d-diagram-lines">
          <path d="M120 65 V95 H240 V120" />
          <path d="M360 65 V95 H240 V120" />
          <path d="M240 166 V190" />
        </g>

        <rect
          x="15" y="12" width="210" height="53"
          rx="9"
          className="c2d-diagram-node"
        />

        <text x="120" y="35" textAnchor="middle">
          VIRTUAL CONTROLS
        </text>
        <text
          x="120" y="51" textAnchor="middle"
          className="c2d-diagram-sub"
        >
          Master / Emergency / Doors
        </text>

        <rect
          x="255" y="12" width="210" height="53"
          rx="9"
          className="c2d-diagram-node"
        />

        <text x="360" y="35" textAnchor="middle">
          INPUT MANAGEMENT
        </text>

        <text
          x="360" y="51" textAnchor="middle"
          className="c2d-diagram-sub"
        >
          Commands
        </text>

        <rect
          x="135" y="120" width="210" height="46"
          rx="9"
          className="c2d-diagram-engine"
        />

        <text x="240" y="148" textAnchor="middle">
          SIMULATION ENGINE
        </text>

        <rect
          x="135" y="190" width="210" height="46"
          rx="9"
          className="c2d-diagram-node"
        />

        <text x="240" y="210" textAnchor="middle">
          OPERATING INDICATIONS
        </text>

        <text
          x="240" y="225" textAnchor="middle"
          className="c2d-diagram-sub"
        >
          Display / Door Lamp
        </text>
      </svg>

      <p className="c2d-info-description">
        Conceptual command and state flow.
        Hardware inputs follow the same
        centralized command-processing system.
      </p>
    </section>
  );
}
