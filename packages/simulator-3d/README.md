# TRAINEX 3D Simulator — In-Frame Game HUD + Mobile Controls

Complete `@trainex/simulator-3d` workspace based on the supplied simulator-3d.zip.

## UI

- Same simulator-style layout as 2D: six shared-state readings, in-frame session toolbar, and fullscreen viewer.
- The HUD has Start/Resume, Pause, Reset, End and Expand controls with icons and disabled states.
- No component information popups, guide notifications, or out-of-frame operating button bank.
- Your imported GLB remains the cabin's source; this update adds no GLB model files.

## Interaction

Desktop: click original in-cab controls, drag to look, WASD/arrows to move inside the authored cab envelope, mouse wheel to move forward/back.

Touch: tap operating meshes without simultaneously rotating the camera; one finger swipe to look, two-finger pinch to move forward/back, hold the on-screen D-pad to walk, View button to reset camera.

The D-pad controls **only the viewpoint**. It cannot apply train power, brakes, or doors; those still require operating the cabin meshes.

The original 3D input mapping, gauge animation, and artist GLB loading remain in place.

## Files

- `src/components/Simulator3D.jsx` — 3D simulator UI composition, no notifications.
- `src/components/CabSessionHUD.jsx` — icon HUD inside the game frame.
- `src/components/TrainReadings.jsx` — 2D-matching live train readings.
- `src/components/MobileCabControls.jsx` — hold movement controls and reset view.
- `src/interactions/FirstPersonController.js` — touch and keyboard navigation.
- `src/interactions/RaycastSelector.js` — control tap separation from camera gestures.
- `src/styles/simulator3d.css` — all 3D simulator HUD/mobile/fullscreen styles, self-contained.

## Build

```powershell
cd D:\trainex
npm install --include=optional
npm run test --workspace=@trainex/simulator-3d
npm run build --workspace=./apps/web
npm run dev --workspace=./apps/web
```

`apps/web/src/components/simulation/Trainex3DConnected.jsx` connects all session buttons to the same runtime as 2D. The supplied app navigation CSS updates improve sidebar interaction on phones. Do not overwrite unrelated website files.
