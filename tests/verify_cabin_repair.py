"""Verifies repaired runtime scene excludes broken pieces, preserving artist mesh data.
Run from project root: python tests/verify_cabin_repair.py
"""
from pathlib import Path
import struct, json, hashlib
PROJECT=Path(__file__).resolve().parents[1]
a=PROJECT/'models/blender/cabin/Trainex-Driver Cabin Model 01 - ORIGINAL.glb'
b=PROJECT/'models/exports/cabin/trainex_cabin.glb'

def read(p):
 d=p.read_bytes();magic,version,length=struct.unpack_from('<4sII',d,0)
 assert magic==b'glTF' and version==2 and length==len(d),p
 jl,jt=struct.unpack_from('<I4s',d,12);assert jt==b'JSON'
 spec=json.loads(d[20:20+jl]);bp=20+jl
 bl,bt=struct.unpack_from('<I4s',d,bp);assert bt==b'BIN\0'
 return spec,d[bp+8:bp+8+bl]
original,oa=read(a);repaired,rb=read(b)
assert rb[:len(oa)]==oa, 'Artist vertex/buffer bytes have changed'
assert len(original['nodes'])==len(repaired['nodes'])==395
assert len(original['meshes'])==len(repaired['meshes'])==370
assert len(repaired['textures'])>len(original['textures'])
for old,new in zip(original['nodes'],repaired['nodes']):
 assert {k:v for k,v in old.items() if k!='children'}=={k:v for k,v in new.items() if k!='children'}
 assert set(new.get('children',[])).issubset(old.get('children',[]))
for x,y in zip(original['meshes'],repaired['meshes']):
 for p,q in zip(x['primitives'],y['primitives']):
  assert p.get('indices')==q.get('indices')
  for k,v in p['attributes'].items():assert q['attributes'][k]==v

# Walk only scene-active glTF nodes; all other mesh nodes are archived, not deleted.
scene=repaired['scenes'][repaired.get('scene',0)]
stack=list(scene['nodes']);seen=set()
while stack:
 i=stack.pop()
 if i in seen:continue
 seen.add(i);stack.extend(repaired['nodes'][i].get('children',[]))
active={repaired['nodes'][i].get('name') for i in seen}
archive={'MasterController.001','Floor.001','MiddlePanel.001','RIghtBottomCompartment.001','CommunicationsRadioControlPanel.001','StorageDistributionBoardPanel.006','DistributionBoardPanel.001'}
cover={'FrontWall','FrontWall.001','FrontWall.002'}
assert not (active&(archive|cover)),active&(archive|cover)
for name in ['ENV_Cab_Ceiling','ENV_DriverSeat_Cushion','ENV_DriverSeat_Pedestal','ENV_Cab_LeftWall','ENV_Cab_RightWall','BehindtheControlsCover']:
 assert name in active,name
print('PASS: source geometry bytes identical, 370 meshes and 395 nodes retained, archived groups and protruding front walls absent from ACTIVE scene, full artist cabin preserved.')
