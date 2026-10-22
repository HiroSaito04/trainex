
import { Link } from "react-router-dom";
import BrandWordmark from "./BrandWordmark.jsx";
import "./Footer.css";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "2D Simulator", to: "/simulators/2d" },
      { label: "3D Driver Cabin", to: "/simulators/3d" },
      { label: "Hardware", to: "/hardware" },
    ],
  },
  {
    title: "Education",
    links: [
      { label: "Learning Materials", to: "/learn" },
      { label: "Training Activities", to: "/train" },
      { label: "Railway Glossary", to: "/glossary" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "About TRAINEX", to: "/about" },
      { label: "User Guides", to: "/about/guide" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer trainex-footer">
      <div className="container">
        <div className="trainex-footer-main">
          <div className="trainex-footer-about">
            <Link
              to="/"
              className="trainex-footer-logo"
              aria-label="TRAINEX Home"
            >
              <BrandWordmark />
            </Link>

            <span className="trainex-footer-tagline">
              RAILWAY TRAINING SYSTEM
            </span>

            <p className="trainex-footer-description">
              Explore railway driver-cab controls, learn
              fundamental train operations, and develop
              practical skills through interactive training.
            </p>

            <Link
              to="/simulators"
              className="trainex-footer-action"
            >
              Explore Simulators
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <nav
            className="trainex-footer-navigation"
            aria-label="Footer navigation"
          >
            {footerGroups.map((group) => (
              <div
                className="trainex-footer-group"
                key={group.title}
              >
                <h2>{group.title}</h2>

                <ul>
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="trainex-footer-notice">
          <span
            className="trainex-footer-notice-icon"
            aria-hidden="true"
          >
            i
          </span>

          <p>
            <strong>Educational Use Only.</strong>{" "}
            TRAINEX is a railway training and educational
            simulation platform. It is not a substitute
            for certified railway operating procedures
            or professional driver training.
          </p>
        </div>

        <div className="trainex-footer-bottom">
          <p>
            © {new Date().getFullYear()} TRAINEX.
            Railway Training System.
          </p>

          <span className="trainex-footer-bottom-label">
            LEARN <span>•</span> PRACTICE <span>•</span> EXPLORE
          </span>
        </div>
      </div>
    </footer>
  );
}
