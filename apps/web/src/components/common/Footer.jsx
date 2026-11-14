import { Link } from "react-router-dom";
import BrandWordmark from "./BrandWordmark.jsx";
import "../../assets/styles/components/Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="trainex-footer">
      <div className="container trainex-footer-inner">
        <div className="trainex-footer-main">
          <div className="trainex-footer-brand">
            <Link to="/" className="trainex-footer-logo" aria-label="TRAINEX home">
              <BrandWordmark />
            </Link>
          </div>

        </div>

        <p className="trainex-footer-disclaimer">
          <strong>Educational use only.</strong> TRAINEX is a learning simulator,
          not a substitute for certified railway operating procedures or
          professional driver training.
        </p>

        <div className="trainex-footer-bottom">
          <span>© {year} TRAINEX | Developed by REM GROUP 4 | All rights reserved.</span>
          <span>LEARN <b aria-hidden="true">•</b> PRACTICE <b aria-hidden="true">•</b> EXPLORE</span>
        </div>
      </div>
    </footer>
  );
}
