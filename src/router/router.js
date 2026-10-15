
import { createSimulatorPage } from "../pages/SimulatorPage.js";
import { createNotFoundPage } from "../pages/NotFoundPage.js";

function normalizePath(pathname) {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function isSimulatorRoute(path) {
  return path === "/" || path === "/simulator";
}

export function createRouter({
  outlet,
  mountSimulator,
}) {
  let disposePage = () => {};
  let currentPath = null;

  function scrollToCurrentLocation() {
    requestAnimationFrame(() => {
      if (location.hash) {
        let id;

        try {
          id = decodeURIComponent(location.hash.slice(1));
        } catch {
          return;
        }

        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });
  }

  function render() {
    const path = normalizePath(location.pathname);

    // Navigating between sections of the same page
    // must not restart the Arduino emulator.
    if (path === currentPath) {
      scrollToCurrentLocation();
      return;
    }

    disposePage();
    currentPath = path;

    if (isSimulatorRoute(path)) {
      const page = createSimulatorPage();

      outlet.replaceChildren(page);
      disposePage = mountSimulator(page);

      document.title =
        "TRAINEX | Train Driver's Cab Simulator";
    } else {
      outlet.replaceChildren(createNotFoundPage());
      disposePage = () => {};

      document.title = "404 | TRAINEX";
    }

    scrollToCurrentLocation();
  }

  function onLinkClick(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) return;

    const link = target.closest("a[data-route]");
    if (!link) return;

    if (link.target && link.target !== "_self") return;

    const destination = new URL(link.href);

    if (destination.origin !== location.origin) return;

    event.preventDefault();

    if (
      destination.pathname !== location.pathname ||
      destination.search !== location.search ||
      destination.hash !== location.hash
    ) {
      history.pushState({}, "", destination);
    }

    render();
  }

  document.addEventListener("click", onLinkClick);
  window.addEventListener("popstate", render);

  return {
    start() {
      render();
    },

    navigate(path) {
      history.pushState({}, "", path);
      render();
    },

    dispose() {
      disposePage();
      document.removeEventListener("click", onLinkClick);
      window.removeEventListener("popstate", render);
    },
  };
}

