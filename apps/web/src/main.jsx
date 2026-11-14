import "./assets/styles/index.css";

import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import { initializeTrainexRuntime } from "./integrations/trainexRuntime.js";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("TRAINEX root element was not found.");
}

initializeTrainexRuntime();
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Production-only offline support. Run `npm run build` to generate /sw.js.
// Development stays network-first so newly edited files are never served from an old cache.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((error) => {
        console.warn("TRAINEX offline support could not be enabled:", error);
      });
  });
}
