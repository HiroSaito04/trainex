
import { Link } from "react-router-dom";

import PageHeader from "../components/common/PageHeader.jsx";

const topics = [
  {
    title: "Driver Cabin Fundamentals",
    description:
      "The purpose and organization of the driving workspace.",
  },
  {
    title: "Traction and Braking",
    description:
      "How basic traction, coast, and brake control states differ.",
  },
  {
    title: "Passenger Door Operation",
    description:
      "Why confirmed door closure matters before movement.",
  },
  {
    title: "Operating Indications",
    description:
      "Reading simulated status information and safety indications.",
  },
];

export default function LearningPage() {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="EDUCATION"
        title="Learning Materials"
        description="Introductory topics for understanding core train driver controls and simulation concepts."
      />

      <div className="card-grid two-cols">
        {topics.map((topic) => (
          <article
            className="panel card-stack"
            key={topic.title}
          >
            <h2>{topic.title}</h2>

            <p>{topic.description}</p>
          </article>
        ))}
      </div>

      <div className="panel callout">
        <h2>Railway terminology</h2>

        <p>
          Use the searchable glossary to
          review common terms.
        </p>

        <Link
          className="text-link"
          to="/glossary"
        >
          Open glossary →
        </Link>
      </div>
    </div>
  );
}
