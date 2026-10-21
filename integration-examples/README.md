# How to integrate into apps/web

These are **candidate website files**, not files automatically deployed. Your actual website files were not uploaded for inspection. Make a backup before replacing an existing file.

1. Copy `integrations/trainexRuntime.js` (new) to `apps/web/src/integrations/`.
2. Review/merge `integrations/trainexClient.js` and `integrations/inputAdapter.js` with your existing code rather than blindly overwriting. Other parts of the web app may already import specific exports.
3. Copy `components/simulation/Trainex2DConnected.jsx` (new) into your web app.
4. Add `import { initializeTrainexRuntime } from './integrations/trainexRuntime.js'; initializeTrainexRuntime();` to `apps/web/src/main.jsx` **before** `createRoot(...).render(...)`. Keep all existing imports and rendering code.
5. In `apps/web/src/pages/Simulator2DPage.jsx`, render `<Trainex2DConnected />` and import the new component from `../components/simulation/Trainex2DConnected.jsx`. Remove the old `SessionToolbar` *on this page* if using the included controls, otherwise duplicate toolbars appear.
6. Add `@trainex/contracts`, `@trainex/input-manager`, `@trainex/simulation-engine`, and `@trainex/simulator-2d` as **local workspace dependencies** in `apps/web/package.json`.
7. Merge `integration-examples/packages/simulator-2d/src/hooks/use2DControls.js` with your existing hook to display engine rejection reasons; it must not locally change authoritative state.
8. Run npm install once at your root `D:\trainex` and start your web workspace.

All TRAINEX UI commands go through InputManager before the engine. The engine publishes new immutable snapshots to both the display and door lamp.

**Limitations**: The current 2D components from earlier code must be present. The engine's speed/door timings are prototype parameters; physical behavior must be calibrated. Browser routing/state hooks may require adapting to existing web files.
