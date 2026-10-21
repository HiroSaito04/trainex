# TRAINEX — Artist model preserved (materials + functional display fix)

This is a **correction to the previous over-modified versions**. It is NOT a new cabin model.

## Guarantee — what this package does NOT change

The latest user-uploaded `Trainex-Driver Cabin Model 01.blend` is included byte-for-byte. The latest user-uploaded `.glb` is preserved in `models/blender/cabin/Trainex-Driver Cabin Model 01 - ORIGINAL.glb`. The deployed `trainex_cabin.glb` is made from that exact upload by **only changing glTF PBR material assignments**. Every original vertex/index buffer, mesh geometry, node, parent, translation, rotation, scale, and scene remains exactly the same. No added walls, seats, panels, labels, buttons, or gauge geometries appear in the shipped GLB.

The source GLB has 370 meshes and 395 nodes. See `models/exports/manifests/preservation-report.json` and `tests/verify_model_unchanged.py`.

## Actual problems fixed

- **Floating square speed/brake cards**: Removed. The website paints the live speedometer/brake face **directly on the existing round dial mesh** with generated UV coordinates on a *runtime-only copy* of that mesh geometry. No new plane is attached.
- **Dark TCMS display**: The existing screen mesh gets an unlit readable `CanvasTexture` showing engine speed, master detent, doors, emergency condition. No new screen or floating panel.
- **Unwanted 3D objects**: The old generated reset button, detent plaques, fake lamps, and auxiliary label geometry are no longer injected. The artist's controls and console stay in place.
- **Materials**: The exported GLB now has color/metalness/roughness tuned to powder-coated console surfaces, wall panels, stainless trim, green/red/yellow buttons, rubber flooring, and seat upholstery; original embedded image textures are retained. For editable Blender-only procedural fine bump, run the included script (it saves a NEW `.blend`).
- **Interactions**: Master handle drag is EB/B3/B2/B1/N/P1/P2/P3; original emergency button and both sides' existing door Open/Close caps use engine commands. Original closed-doors lamp responds to state. Emergency reset still needs a **designated original mesh**; none is clearly named as such in the upload. No other safety button was repurposed.
- **Camera**: Existing driver-facing camera preset and inside-only movement / 360-degree look are kept in the simulator. Original uploaded GLB has no camera node, so default is the established simulator preset.
- **Outside controls**: Only session Start, Stop, Reset and Expand Full Screen are shown outside the 3D scene.

## Install

1. In GitHub Desktop, commit your current work or back up `D:\trainex`.
2. Extract this archive to a separate temporary location.
3. Copy **`models/`**, **`packages/simulator-3d/`**, and the included **`apps/web/`** files into `D:\trainex`, merging and replacing matching files. Do not delete other modules.
4. Use the current 8-detent versions of `@trainex/contracts`, `@trainex/input-manager`, and `@trainex/simulation-engine` (already introduced by earlier TRAINEX updates); those packages are **not** replaced by this materials-only fix.
5. Run:

```powershell
cd D:\trainex
npm install
npm run test --workspace=@trainex/simulator-3d
python .\tests\verify_model_unchanged.py
npm run dev --workspace=./apps/web
```

If Python is not installed, omit the verification command; the archive was already checked with that script.

The Vite-served asset is **`apps/web/public/models/cabin/trainex_cabin.glb`**, copied from `models/exports/cabin/trainex_cabin.glb` in this archive. No Blender export is required to run.

### Editable Blender material project (optional)

For the material update in Blender **without moving any objects**:

1. Open the original `models/blender/cabin/Trainex-Driver Cabin Model 01.blend` in Blender **5.1**.
2. Change to **Scripting**, open `models/blender/scripts/apply_materials_without_moving_anything.py`.
3. Click **Run Script**.
4. It saves a NEW project named `Trainex-Driver Cabin Model 01 - MATERIALS ONLY.blend` beside the original (all objects and transforms checked unchanged). The script uses physically-based surface roughness and subtle built-in procedural noise bump, not ugly generated geometry.

**Do not run an older `rebuild_interior.py`, `refine_trainex_glb.py`, or `addPhysicalCabControls()` from past packages**. Those add/modify geometry and caused the unwanted changes.

## Limitations and verification

GLB geometry/material integrity and Node.js command mapping tests have been verified. Full visual rendering and real click coordinates in your local Chrome/Vite instance have **not** been verified here. Brake-cylinder and brake-pipe needles will show unavailable values if the engine doesn't provide modeled kPa. The exact physical location of an EB reset button and eight printed detent labels requires an artist-provided named mesh/texture surface; new objects are intentionally not invented.
