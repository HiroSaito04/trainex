# TRAINEX model files — restored source and clean browser export

- `blender/cabin/Trainex-Driver Cabin Model 01 - ORIGINAL.blend`: **untouched uploaded artist source**. Never overwrite this automatically.
- `blender/cabin/Trainex-Driver Cabin Model 01 - ORIGINAL.glb`: **untouched uploaded source GLB**.
- `blender/cabin/Trainex-Driver Cabin Model 01 - PBR BASE.glb`: intermediate material-only GLB used for deterministic rebuilds (all original geometry unchanged).
- `blender/scripts/repair_original_blender.py`: Blender 5.1 script to create a NEW editable .blend with the visually broken ten parts hidden and improved procedural shaders. Does not delete or move geometry.
- `blender/scripts/rebuild_browser_glb.py`: offline material/scene assembler (Python, numpy, Pillow).
- `exports/cabin/trainex_cabin.glb`: repaired runtime GLB for TRAINEX website.
- `exports/manifests/repair-report.json`: hashes, mesh counts, visibility changes, embedded texture summary.
- `textures/`: matching image textures embedded in the browser GLB; retained separately for editing.

Important: The three oversized upper `FrontWall` pieces and seven overlapping, unassembled root groups are *excluded only from the runtime scene*. They remain in the preserved original files. The author's cab design, positions, and scene geometry are not reconstructed or replaced.
