
import "./style.css";

import { createNavbar } from "./components/Navbar.js";
import { createFooter } from "./components/Footer.js";

import { initializeTheme, mountThemeToggle } from "./services/theme.js";
import { createRouter } from "./router/router.js";
import { mountSimulator } from "./features/simulator/mountSimulator.js";

// ==========================================
// INITIALIZE THEME
// ==========================================

initializeTheme();

// ==========================================
// MOUNT SHARED COMPONENTS
// ==========================================

const navbar = createNavbar();
const footer = createFooter();

document
  .querySelector("#navbar-root")
  .replaceChildren(navbar);

document
  .querySelector("#footer-root")
  .replaceChildren(footer);

const disposeTheme = mountThemeToggle(navbar);

// ==========================================
// INITIALIZE ROUTER
// ==========================================

const router = createRouter({
  outlet: document.querySelector("#app"),
  mountSimulator,
});

router.start();

// ==========================================
// DEVELOPMENT CLEANUP
// ==========================================

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    router.dispose();
    disposeTheme();
  });
}
