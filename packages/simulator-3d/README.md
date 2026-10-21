# @trainex/simulator-3d — artist model build

Browser Three.js driver-cab viewer using the *unchanged artist-authored* GLB
at `/models/cabin/trainex_cabin.glb`. This is the same binary file the user
uploaded as `Trainex-Driver Cabin Model 01.glb`.

## Interaction

- Master handle: drag the real mesh, or click the eight small plaques beside it.
  EB → B3 → B2 → B1 → N → P1 → P2 → P3. Brake pulls rearward;
  traction pushes forward; neutral is upright.
- Emergency Brake activates using original red cap. A separate yellow in-cab
  reset cap is added at runtime beside it.
- Left and right in-cab Open/Close caps submit shared engine door commands.
- Main TCMS surface, speedometer, brake-cylinder gauge and brake-pipe gauge
  receive texture overlays fitted to their real visible source mesh bounds.
- All Doors Closed and runtime-added All Doors Open lamps respond to train
  state. No fake pressure readings are produced.

## View

Use the current driver-eye camera preset as the default. Pointer drag freely
rotates through 360 degrees. WASD/arrows/scroll movement is limited to an
interior bounding box. No camera control moves the user outside the cabin.
Session Start, Stop, Reset and Full Screen are the only external controls.

## Source preservation

The original GLB has extra duplicate/archive root objects. The browser hides
those roots, does **not** delete or transform them, and `findSceneObjects`
selects only visible nodes. The original `.blend`, `.blend1` and `.glb` remain
in `models/blender/cabin/`.

Runtime coloration is conservative, retains the source's embedded textures,
and never changes the material texture maps' UVs or the mesh positions.

## Test

`npm run test --workspace=@trainex/simulator-3d`

For integration test, run at monorepo root:

`node --test tests/integration/3dEngineFlow.test.js`

Actual visual placement, occlusion, font legibility and the original Blender
camera are not verified by Node tests. The uploaded GLB has no exported camera.
