
import {
  COMPONENT_INFO,
} from "../../config/consoleLayout.js";

export default function ComponentInfoPanel({
  selectedId,
  onSelect,
}) {
  const component = COMPONENT_INFO[selectedId];

  return (
    <section className="c2d-info-card">
      <div className="c2d-info-heading">
        <span className="c2d-eyebrow">
          COMPONENT EXPLORER
        </span>

        <h3>Equipment Information</h3>
      </div>

      <div className="c2d-component-list">
        {Object.entries(COMPONENT_INFO).map(
          ([id, item]) => (
            <button
              type="button"
              key={id}
              className={`c2d-component-option ${
                selectedId === id
                  ? "is-selected"
                  : ""
              }`}
              aria-pressed={selectedId === id}
              onClick={() => onSelect(id)}
            >
              {item.title}
              <span aria-hidden="true">↗</span>
            </button>
          )
        )}
      </div>

      {component && (
        <article className="c2d-component-details">
          <span className="c2d-eyebrow">
            SELECTED EQUIPMENT
          </span>

          <h4>{component.title}</h4>

          <p>{component.description}</p>

          <div className="c2d-component-tip">
            <strong>How to use</strong>
            <p>{component.instruction}</p>
          </div>
        </article>
      )}
    </section>
  );
}
