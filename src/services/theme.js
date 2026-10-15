
const STORAGE_KEY = "trainex-theme";
const THEMES = ["light", "dark"];

function getStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return THEMES.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

export function getTheme() {
  return document.documentElement.dataset.theme ||
    getStoredTheme() ||
    getSystemTheme();
}

export function setTheme(theme) {
  if (!THEMES.includes(theme)) {
    throw new Error(`Invalid theme: ${theme}`);
  }

  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Theme still works if browser storage is unavailable.
  }

  const themeColor = document.querySelector(
    'meta[name="theme-color"]'
  );

  themeColor?.setAttribute(
    "content",
    theme === "dark" ? "#080e19" : "#f5f8fc"
  );

  document.dispatchEvent(
    new CustomEvent("trainex:themechange", {
      detail: { theme },
    })
  );
}

export function initializeTheme() {
  const theme = getStoredTheme() || getSystemTheme();

  document.documentElement.dataset.theme = theme;

  const themeColor = document.querySelector(
    'meta[name="theme-color"]'
  );

  themeColor?.setAttribute(
    "content",
    theme === "dark" ? "#080e19" : "#f5f8fc"
  );
}

export function mountThemeToggle(container) {
  const button = container.querySelector(
    "[data-theme-toggle]"
  );

  if (!button) return () => {};

  function render() {
    const isDark = getTheme() === "dark";

    button.textContent = isDark
      ? "☀ Light mode"
      : "☾ Dark mode";

    button.setAttribute(
      "aria-label",
      isDark
        ? "Switch to light mode"
        : "Switch to dark mode"
    );
  }

  function toggle() {
    setTheme(
      getTheme() === "dark" ? "light" : "dark"
    );
  }

  button.addEventListener("click", toggle);

  document.addEventListener(
    "trainex:themechange",
    render
  );

  render();

  return () => {
    button.removeEventListener("click", toggle);
    document.removeEventListener(
      "trainex:themechange",
      render
    );
  };
}
