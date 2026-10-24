import "./assets/styles/index.css";

import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import {
  initializeTrainexRuntime,
} from "./integrations/trainexRuntime.js";



const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "TRAINEX root element was not found."
  );
}

initializeTrainexRuntime();
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
