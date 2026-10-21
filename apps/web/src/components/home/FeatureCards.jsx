
import { Link } from "react-router-dom";

const features = [
  {
    title: "2D Driver Controls",
    description:
      "A simplified interactive panel built for accessible control learning.",
    to: "/simulators/2d",
    icon: "▦",
  },
  {
    title: "3D Cabin Exploration",
    description:
      "Explore the driver's workspace and supported operating components.",
    to: "/simulators/3d",
    icon: "⬡",
  },
  {
    title: "Training Activities",
    description:
      "Follow guided procedures and learn the purpose of core equipment.",
    to: "/training",
    icon: "✓",
  },
];

export default function FeatureCards() {
  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">
          TRAINEX FEATURES
        </p>

        <h2>
          Learn through interaction
        </h2>
      </div>

      <div className="card-grid">
        {features.map(({
          title,
          description,
          to,
          icon,
        }) => (
          <Link
            className="panel feature-card"
            key={to}
            to={to}
          >
            <div
              className="feature-icon"
              aria-hidden="true"
            >
              {icon}
            </div>

            <h3>{title}</h3>

            <p>{description}</p>

            <span className="card-link">
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
