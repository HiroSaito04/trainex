
import { useState } from "react";

import PageHeader from "../components/common/PageHeader.jsx";

const entries = [
  {
    term: "All Doors Closed",
    category: "Passenger doors",
    description:
      "A simulated indication that every modeled passenger door has reached its confirmed closed state.",
  },
  {
    term: "Coasting",
    category: "Train operation",
    description:
      "Operating without active traction or service braking request from the master handle.",
  },
  {
    term: "Emergency Brake",
    category: "Braking",
    description:
      "A braking function that overrides normal traction requests in the TRAINEX operating model.",
  },
  {
    term: "Front Display Panel",
    category: "Operating indications",
    description:
      "The cabin display that presents train operating information derived from the simulation state.",
  },
  {
    term: "Master Control Handle",
    category: "Train controls",
    description:
      "A driver control for selecting supported traction, coasting, and braking settings.",
  },
  {
    term: "Passenger Door Controls",
    category: "Passenger doors",
    description:
      "Controls that request opening or closing of simulated passenger doors.",
  },
  {
    term: "Traction",
    category: "Train operation",
    description:
      "Propulsive force that produces a simulated movement response when operating conditions permit.",
  },
];

export default function GlossaryPage() {
  const [query, setQuery] = useState("");

  const result = entries.filter((entry) =>
    `${entry.term} ${entry.category} ${entry.description}`
      .toLowerCase()
      .includes(query.toLowerCase().trim())
  );

  return (
    <div className="container page">
      <PageHeader
        eyebrow="REFERENCE"
        title="Railway Glossary"
        description="Search selected introductory terms used in TRAINEX."
      />

      <label
        className="search-label"
        htmlFor="glossary-search"
      >
        Search terms
      </label>

      <input
        id="glossary-search"
        className="search-input"
        placeholder="Try braking, doors, traction…"
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
      />

      <p
        className="results-count"
        aria-live="polite"
      >
        {result.length} matching{" "}
        {result.length === 1
          ? "entry"
          : "entries"}
      </p>

      <div className="card-grid two-cols">
        {result.map(({
          term,
          category,
          description,
        }) => (
          <article
            className="panel card-stack"
            key={term}
          >
            <p className="eyebrow">
              {category}
            </p>

            <h2>{term}</h2>

            <p>{description}</p>
          </article>
        ))}
      </div>

      {result.length === 0 && (
        <p className="notice">
          No matching terms were found.
        </p>
      )}
    </div>
  );
}
