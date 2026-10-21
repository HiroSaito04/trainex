import {
  useSyncExternalStore,
} from "react";

const listeners = new Set();

const storedTheme = (() => {
  try {
    return window.localStorage.getItem(
      "trainex-theme"
    );
  } catch {
    return null;
  }
})();

let theme =
  storedTheme === "light" ? "light" : "dark";

document.documentElement.dataset.theme = theme;

function subscribe(callback) {
  listeners.add(callback);

  return () => listeners.delete(callback);
}

export function setTheme(nextTheme) {
  theme =
    nextTheme === "light" ? "light" : "dark";

  document.documentElement.dataset.theme = theme;

  try {
    window.localStorage.setItem(
      "trainex-theme",
      theme
    );
  } catch {
    // Local storage is optional.
  }

  listeners.forEach((callback) => callback());
}

export function useTheme() {
  const current = useSyncExternalStore(
    subscribe,
    () => theme
  );

  return {
    theme: current,
    setTheme,
    toggleTheme: () =>
      setTheme(
        current === "dark" ? "light" : "dark"
      ),
  };
}
