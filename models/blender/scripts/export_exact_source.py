"""Optional Blender export of the uploaded artist-authored .blend.

Run through Blender's Python interpreter (not python.exe):
  blender -b --python models/blender/scripts/export_exact_source.py

Important: The package ALREADY includes the exact matching uploaded GLB. It is
not necessary to run this script unless the artist makes newer .blend changes.
This script NEVER changes object transforms, meshes, materials, or collections.
"""
from pathlib import Path
import shutil
import bpy

ROOT = Path(__file__).resolve().parents[3]
BLEND = ROOT / 'models' / 'blender' / 'cabin' / 'Trainex-Driver Cabin Model 01.blend'
OUTPUT = ROOT / 'models' / 'exports' / 'cabin' / 'trainex_cabin.glb'
PUBLIC = ROOT / 'apps' / 'web' / 'public' / 'models' / 'cabin' / 'trainex_cabin.glb'

assert BLEND.is_file(), f'Missing Blender file: {BLEND}'
bpy.ops.wm.open_mainfile(filepath=str(BLEND))
pre = {o.name: tuple(round(v, 7) for row in o.matrix_world for v in row) for o in bpy.data.objects}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
# Export visible objects only so obsolete source collections cannot overlap the
# assembled cabin. This is an export setting; authored geometry is not changed.
bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT), export_format='GLB', export_yup=True,
    export_extras=True, use_visible=True,
    export_cameras=True, export_lights=True,
)
for o in bpy.data.objects:
    values = tuple(round(v, 7) for row in o.matrix_world for v in row)
    assert pre[o.name] == values, f'Unexpected transform change: {o.name}'
PUBLIC.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(OUTPUT, PUBLIC)
print(f'Exported artist-authored scene to {OUTPUT}')
