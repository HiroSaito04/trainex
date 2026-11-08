# @trainex/simulator-2d

Complete TRAINEX 2D driver-cab workspace using the user's original `TRAINEX-Driver-Cab-2D.svg`. The SVG geometry is not modified by the simulator.

The 2D cab overlays authoritative state indications and SVG-coordinate-space hit shapes over the existing art; physical control inputs use the shared input manager. Radio and electrical controls without engine commands show functional descriptions when selected; vigilance acknowledgement and its indicator are active in the latest 2D layer-binding revision.

The in-frame HUD provides Start, Pause, Reset and End session actions and expandable fullscreen, plus independent **Guide On/Off** and **Explanations On/Off** switches. In ordinary view, component details and the context-sensitive guide appear **below the simulator artwork** in readable cards. In expanded fullscreen, the same information appears as compact nonblocking notification toasts at the top-right. Fullscreen component toasts auto-dismiss after a short interval; the normal-view information card stays visible until dismissed. When a preference is off, its corresponding information is hidden. The Simulation Engine remains authoritative and may reject invalid commands.

The component-search panel and Fit/zoom buttons are intentionally removed. Mobile starts with the complete cab fitted to the page width and uses a collapsible accessible master-handle selector beneath it.

### Web integration

Use `Trainex2DConnected.jsx` from the ZIP to pass `sessionStatus`, `sessionActions`, and the centralized `sendTrainexInput` dispatcher to `Simulator2D`.

### Tests

Run `npm run test:revision` from the root monorepo for the current SVG/engine revisions. Some historical package tests still assert the superseded eight-position artwork and are retained as legacy tests.

## Vigilance / emergency controls
The master handle EB detent and separate Security Brake button activate emergency braking. A separate release command clears the emergency condition after standstill with N selected and a three-second release interval. The vigilance timer is enabled in the latest 2D layer-binding revision; it is authoritative in the simulation engine.
