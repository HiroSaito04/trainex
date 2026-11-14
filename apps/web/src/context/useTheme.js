import { useSyncExternalStore } from "react";

const STORAGE_KEY = "trainex-theme";
const listeners = new Set();
const systemThemeQuery = typeof window === "undefined" || !window.matchMedia
  ? null
  : window.matchMedia("(prefers-color-scheme: dark)");

function getSavedTheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return systemThemeQuery?.matches ? "dark" : "light";
}

const savedTheme = getSavedTheme();
let followsSystemTheme = savedTheme === null;
let theme = savedTheme ?? getSystemTheme();

function updateDocumentTheme() {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
  }
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

updateDocumentTheme();

// Track OS theme changes only until the user chooses a TRAINEX theme.
function onSystemThemeChange() {
  if (!followsSystemTheme) return;
  const nextTheme = getSystemTheme();
  if (theme === nextTheme) return;
  theme = nextTheme;
  updateDocumentTheme();
  notifyListeners();
}

if (systemThemeQuery) {
  if (typeof systemThemeQuery.addEventListener === "function") {
    systemThemeQuery.addEventListener("change", onSystemThemeChange);
  } else if (typeof systemThemeQuery.addListener === "function") {
    systemThemeQuery.addListener(onSystemThemeChange);
  }
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTheme(nextTheme) {
  const selectedTheme = nextTheme === "light" ? "light" : "dark";
  followsSystemTheme = false;
  theme = selectedTheme;
  updateDocumentTheme();

  try {
    window.localStorage.setItem(STORAGE_KEY, selectedTheme);
  } catch {
    // The theme still applies during this session if storage is unavailable.
  }

  notifyListeners();
}

export function useTheme() {
  const current = useSyncExternalStore(subscribe, () => theme, () => theme);
  return {
    theme: current,
    setTheme,
    toggleTheme: () => setTheme(current === "dark" ? "light" : "dark"),
  };
}
