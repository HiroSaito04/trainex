# TRAINEX — Original cabin STRUCTURE cleanup + realistic materials

**Target:** `D:\trainex` (Windows, Blender 5.1)

This update is intentionally limited to fixing the two visual defects in your screenshots. It **does not redesign the console, reposition controls or chair, or change the railway cab's underlying mesh geometry**.

## What caused the defects

1. **Front cab cover:** `FrontWall`, `FrontWall.001` and `FrontWall.002` extend to Y=4.79–5.05 m, higher than the original `ENV_Cab_Ceiling` (Y=3.72–3.80 m). They are the oversized protruding roof/upper-front pieces. This release excludes only those three objects from the **active browser scene**; your original file still contains them. Existing roof, cabin sidewalls, windshield pillars, crossbeams and lower front wall are retained.
2. **Under-chair / footwell artifacts:** The GLB originally included seven unassembled source collections *as visible scene roots* in addition to the assembled cab. They overlap the floor, driver seat, pedals and desk, causing ghosted polygons / z-fighting. This release excludes the seven groups from the active browser scene. All objects remain stored in your unchanged original Blender project.

## What is NOT altered

- Your original `Trainex-Driver Cabin Model 01 - ORIGINAL.blend` is a byte-identical copy of your uploaded original.
- Your original `Trainex-Driver Cabin Model 01 - ORIGINAL.glb` is also preserved byte-for-byte.
- The supplied browser GLB retains **370 original mesh definitions and 395 nodes**, with the original vertex and index data unchanged, and **no moved/rotated/rebuilt controls, walls, chair, or panels**.
- Original screen artwork and other existing textures are not replaced by newly generated meshes.
- The camera's established driver-eye preset, interior movement restrictions, 360° look, in-cab control logic and external session controls remain part of the simulator-3d implementation.

## Materials and textures

The updated `trainex_cabin.glb` adds **11 embedded PBR image maps** for subtle powder-coated steel, brushed metal, wall vinyl, dark plastics, seat fabric and anti-slip rubber. The materials have restrained colors, roughness and normal details; they do not alter the artist's geometry. The `models/textures/` PNGs are included for inspection, but the browser GLB contains its own embedded copies.

To view actual materials in Blender, choose **Material Preview** or **Rendered** mode; Solid mode remains mostly gray regardless of textures.

## Install into D:\trainex

1. Commit or back up your existing TRAINEX directory.
2. Extract this ZIP into a temporary folder.
3. Copy **`models/`**, **`packages/simulator-3d/`**, **`apps/`**, and **`tests/`** into `D:\trainex`, merging and replacing matching files. **Do not delete unrelated packages.**
4. The ready-to-use model is included in both:
   - `models/exports/cabin/trainex_cabin.glb`
   - `apps/web/public/models/cabin/trainex_cabin.glb`
5. Start the website and force-refresh the browser to avoid cached older GLBs:

```powershell
cd D:\trainex
npm install
npm run test --workspace=@trainex/simulator-3d
python .\tests\verify_cabin_repair.py
npm run dev --workspace=./apps/web
```

If Python is not installed, omit the Python check. It was already run successfully during packaging.

### Update the editable Blender project without touching your original

The source `.blend` has deliberately not been modified. If you want these visibility/material fixes in an editable Blender project:

1. Open `models/blender/cabin/Trainex-Driver Cabin Model 01 - ORIGINAL.blend` in Blender **5.1**.
2. Switch to **Scripting** and open `models/blender/scripts/repair_original_blender.py`.
3. Click **Run Script**.
4. Blender will save **`Trainex-Driver Cabin Model 01 - CLEAN STRUCTURE & MATERIALS.blend`** as a separate file beside the original. It hides rather than deletes 10 problematic root/upper-cover objects, upgrades materials in place, and checks original vertex positions and world transforms.

The supplied website GLB does **not** depend on running this script; it is ready to load as supplied. `models/blender/scripts/rebuild_browser_glb.py` can recreate the GLB from the two bundled source GLBs if you have Python, Pillow and NumPy; it does not require Blender.

## Tests run for this release

- Structural comparison of all original vertex/index buffer data against the repaired GLB: **pass**.
- Original mesh count (370), node count (395), world/local node transforms: **unchanged**.
- Original seven unassembled roots and three mispositioned front covers no longer reachable in the browser scene: **pass**.
- Existing cabinet, walls, chair, ceiling, front supports retained in the browser scene: **pass**.
- 3D command-mapping tests: **14 passed**.
- GLB parsed by `trimesh` with its embedded image/normal textures: **pass**.

**Not verified here:** Blender 5.1 execution of the editable `.blend` script, the final rendered look in your local Three.js/browser, and the precise screen-space click targets. A camera screenshot from the updated browser is the best way to verify remaining visual adjustments.

**Safety note:** This file is for a training prototype, not a certified replica of a production driving cab. Pressure-gauge kPa readings must come from authoritative modeled state; this update does not fabricate them.
