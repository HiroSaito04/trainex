
import { Link } from "react-router-dom";

import BrandWordmark from "./BrandWordmark.jsx";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">

        <div className="footer-identity">
          <Link
            to="/"
            className="footer-brand"
            aria-label="TRAINEX home"
          >
            <BrandWordmark />
          </Link>

          <p>
            Interactive railway driver
            training and education.
          </p>
        </div>

        <nav
          className="footer-links"
          aria-label="Footer navigation"
        >
          <Link to="/about">
            About & Help
          </Link>

          <Link to="/learn">
            Learning Materials
          </Link>

          <Link to="/glossary">
            Railway Glossary
          </Link>

          <Link to="/hardware">
            Hardware
          </Link>
        </nav>

        <div className="footer-meta">
          <span>
            TRAINEX PROJECT
          </span>

          <small>
            Educational simulator.
            Not for operational railway use.
          </small>
        </div>
      </div>
    </footer>
  );
}
