import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import { Simulator2D } from "@trainex/simulator-2d";
import { Simulator3D } from "@trainex/simulator-3d";
import { registerSimulator2D } from "./integrations/simulator2DAdapter.js";
import { registerSimulator3D } from "./integrations/simulator3DAdapter.js";
import {
  initializeTrainexRuntime,
} from "./integrations/trainexRuntime.js";


import "./assets/styles/index.css";

registerSimulator2D(Simulator2D);
registerSimulator3D(Simulator3D);

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
