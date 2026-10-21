
import PageHeader from "../components/common/PageHeader.jsx";

const activities = [
  [
    "Identify the controls",
    "Find and describe the five required console elements.",
  ],
  [
    "Passenger doors",
    "Study closing commands and the All Doors Closed indication.",
  ],
  [
    "Master handle",
    "Review traction, coasting, and service braking states.",
  ],
  [
    "Emergency response",
    "Study emergency brake activation and reset conditions.",
  ],
];

export default function TrainingPage() {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="GUIDED LEARNING"
        title="Training Activities"
        description="A starting catalog for structured operating activities. Automated scenario evaluation will be provided by the separate training package."
      />

      <div className="card-grid two-cols">
        {activities.map(
          ([title, description], index) => (
            <article
              className="panel card-stack"
              key={title}
            >
              <p className="eyebrow">
                ACTIVITY{" "}
                {String(index + 1).padStart(2, "0")}
              </p>

              <h2>{title}</h2>

              <p>{description}</p>

              <span className="status-badge">
                Content overview
              </span>
            </article>
          )
        )}
      </div>
    </div>
  );
}
