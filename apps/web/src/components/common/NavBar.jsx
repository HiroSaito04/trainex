
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  navigation,
} from "../../data/navigation.js";

import BrandWordmark from "./BrandWordmark.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return open ? (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 5 19 19" />
      <path d="M19 5 5 19" />
    </svg>
  ) : (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function getNavClass({ isActive }) {
  return isActive
    ? "nav-link active"
    : "nav-link";
}

export default function NavBar() {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const toggleRef = useRef(null);
  const closeRef = useRef(null);
  const sidebarRef = useRef(null);

  const closeSidebar = () => setIsOpen(false);

  // Close when navigating to a different route.
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close the sidebar if the viewport becomes desktop-sized.
  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1121px)"
    );

    const handleChange = () => {
      if (media.matches) {
        setIsOpen(false);
      }
    };

    media.addEventListener(
      "change",
      handleChange
    );

    return () => {
      media.removeEventListener(
        "change",
        handleChange
      );
    };
  }, []);

  // Manage focus, Escape and background scroll.
  useEffect(() => {
    if (!isOpen) return;

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        sidebarRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        oldOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      toggleRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <header className="site-header">
        <div className="container nav-inner">

          {/* TRAINEX WORDMARK */}

          <Link
            to="/"
            className="nav-brand"
            aria-label="TRAINEX home"
            onClick={closeSidebar}
          >
            <BrandWordmark />

            <span className="brand-tagline">
              RAILWAY TRAINING SYSTEM
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav
            className="desktop-nav"
            aria-label="Main navigation"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={getNavClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}

          <div className="nav-actions">
            <div className="desktop-actions">
              <ThemeToggle />

              <Link
                to="/simulators"
                className="nav-cta"
              >
                <span>
                  Launch Simulator
                </span>

                <ArrowIcon />
              </Link>
            </div>

            {/* MOBILE MENU BUTTON */}

            <button
              ref={toggleRef}
              type="button"
              className={`menu-toggle ${
                isOpen ? "is-open" : ""
              }`}
              aria-label={
                isOpen
                  ? "Close navigation"
                  : "Open navigation"
              }
              aria-expanded={isOpen}
              aria-controls="trainex-mobile-sidebar"
              onClick={() =>
                setIsOpen((previous) => !previous)
              }
            >
              <MenuIcon open={isOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR BACKDROP */}

      <button
        type="button"
        className={`sidebar-backdrop ${
          isOpen ? "is-visible" : ""
        }`}
        tabIndex={-1}
        aria-label="Close sidebar"
        onClick={closeSidebar}
      />

      {/* MOBILE SIDEBAR */}

      <aside
        id="trainex-mobile-sidebar"
        ref={sidebarRef}
        className={`mobile-sidebar ${
          isOpen ? "is-open" : ""
        }`}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="sidebar-header">
          <Link
            to="/"
            className="sidebar-brand"
            onClick={closeSidebar}
            aria-label="TRAINEX home"
          >
            <BrandWordmark />
          </Link>

          <button
            ref={closeRef}
            className="sidebar-close"
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
          >
            <MenuIcon open />
          </button>
        </div>

        <div className="sidebar-body">
          <div className="sidebar-intro">
            <span className="sidebar-eyebrow">
              NAVIGATION
            </span>

            <h2>Explore TRAINEX</h2>

            <p>
              Your gateway to railway
              simulation and learning.
            </p>
          </div>

          <nav
            className="sidebar-nav"
            aria-label="Mobile main navigation"
          >
            {navigation.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
                onClick={closeSidebar}
              >
                <span className="sidebar-link-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </span>

                <span className="sidebar-link-text">
                  {item.label}
                </span>

                <span
                  className="sidebar-link-arrow"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-secondary">
            <span className="sidebar-eyebrow">
              QUICK ACCESS
            </span>

            <Link
              to="/glossary"
              className="sidebar-secondary-link"
              onClick={closeSidebar}
            >
              Railway Glossary
              <ArrowIcon />
            </Link>
          </div>

          <Link
            className="sidebar-cta"
            to="/simulators"
            onClick={closeSidebar}
          >
            <span>
              Launch Simulator
            </span>

            <ArrowIcon />
          </Link>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-theme-row">
            <span>Appearance</span>
            <ThemeToggle />
          </div>

          <p>
            TRAINEX · Interactive railway
            education
          </p>
        </div>
      </aside>
    </>
  );
}
