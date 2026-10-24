# @trainex/simulator-2d

Complete TRAINEX 2D driver-cab workspace using the user's original `TRAINEX-Driver-Cab-2D.svg`. The SVG geometry is not modified by the simulator.

The 2D cab overlays authoritative state indications and SVG-coordinate-space hit shapes over the existing art; physical control inputs use the shared input manager. Unsupported radio, vigilance and electrical controls are inspect-only.

The in-frame HUD provides Start, Pause, Reset and End session actions and expandable fullscreen. The component details and context-sensitive driver guide are two separate, small notices at the upper-right of the artwork. The guide includes warnings for door operation while traction is selected or while moving, traction with unconfirmed closed doors, and premature emergency reset. The Simulation Engine remains authoritative and may reject other commands; rejected reasons are presented to the operator.

The component-search panel and Fit/zoom buttons are intentionally removed. Mobile starts with the complete cab fitted to the page width and uses a collapsible accessible master-handle selector beneath it.

### Web integration

Use `Trainex2DConnected.jsx` from the ZIP to pass `sessionStatus`, `sessionActions`, and the centralized `sendTrainexInput` dispatcher to `Simulator2D`.

### Tests

Run `npm run test --workspace=@trainex/simulator-2d` from the root monorepo.
