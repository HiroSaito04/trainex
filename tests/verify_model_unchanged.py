"""Verify TRAINEX finished model differs from the exact upload ONLY in materials.
Usage: python tests/verify_model_unchanged.py (run from project root).
No third-party Python dependencies are needed.
"""
from pathlib import Path
import copy,json,struct,hashlib


def load(path):
    b=Path(path).read_bytes()
    assert b[:4]==b'glTF'
    assert struct.unpack_from('<I',b,8)[0]==len(b)
    length,tag=struct.unpack_from('<I4s',b,12)
    assert tag==b'JSON'
    return json.loads(b[20:20+length]),b[20+length:]

root=Path(__file__).resolve().parents[1]
a,abin=load(root/'models/blender/cabin/Trainex-Driver Cabin Model 01 - ORIGINAL.glb')
b,bbin=load(root/'models/exports/cabin/trainex_cabin.glb')
assert abin==bbin, 'Geometry/binary chunk changed'
for key in ('nodes','accessors','bufferViews','scenes','images','textures','buffers','animations','cameras','skins'):
    assert a.get(key)==b.get(key),f'GLB {key} changed'
for mesh_a,mesh_b in zip(a['meshes'],b['meshes']):
    ma=copy.deepcopy(mesh_a);mb=copy.deepcopy(mesh_b)
    for mesh in (ma,mb):
        for prim in mesh['primitives']:prim.pop('material',None)
    assert ma==mb,'A source mesh changed beyond material assignment'
assert len(a['meshes'])==len(b['meshes'])
print(f'PASS: {len(a["meshes"])} original meshes, {len(a["nodes"])} original nodes, identical BIN bytes and transforms.')
print('Only glTF material properties/assignments differ; no geometry or layout changes.')
