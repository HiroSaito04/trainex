"""Repair TRAINEX browser GLB without moving/deforming artist geometry.

Requires: Python 3.10+, numpy, Pillow. Uses the original artist GLB and the
prior materials-only GLB. Mutates only GLTF scene visibility, material data,
and newly appended UV/texture buffer data. Position/index bytes and matrices
remain unchanged. Does not add replacement geometry.
"""
from __future__ import annotations
import copy, hashlib, io, json, pathlib, struct
from collections import Counter
import numpy as np
from PIL import Image, ImageFilter

OUTROOT=pathlib.Path(__file__).resolve().parents[2]
SOURCE=OUTROOT/'blender/cabin/Trainex-Driver Cabin Model 01 - ORIGINAL.glb'
MATERIAL_BASE=OUTROOT/'blender/cabin/Trainex-Driver Cabin Model 01 - PBR BASE.glb'
TARGET=OUTROOT/'exports/cabin/trainex_cabin.glb'
TEXTURES=OUTROOT/'textures'
TEXTURES.mkdir(parents=True,exist_ok=True)

STAGING_ROOTS={
    'MasterController.001','Floor.001','MiddlePanel.001',
    'RIghtBottomCompartment.001','CommunicationsRadioControlPanel.001',
    'StorageDistributionBoardPanel.006','DistributionBoardPanel.001',
}
# These three upper FrontWall pieces are the incorrect protruding triangles,
# climbing to 4.8–5.05m although the roof is at 3.72–3.80m. The original
# lower front wall, sill, pillars and roof are kept entirely unchanged.
PROTRUDING_COVER={'FrontWall','FrontWall.001','FrontWall.002'}

def parse_glb(path):
    raw=path.read_bytes();magic,version,total=struct.unpack_from('<4sII',raw)
    assert magic==b'glTF' and version==2 and len(raw)==total, path
    jslen,jsmagic=struct.unpack_from('<I4s',raw,12);assert jsmagic==b'JSON'
    data=json.loads(raw[20:20+jslen]);next_header=20+jslen
    binlen,binmagic=struct.unpack_from('<I4s',raw,next_header);assert binmagic==b'BIN\0'
    binary=raw[next_header+8:next_header+8+binlen]
    assert len(binary)==binlen
    return data,binary

styled,original_binary=parse_glb(MATERIAL_BASE)
artist,artist_binary=parse_glb(SOURCE)
assert original_binary==artist_binary, 'Base geometry changed — do not proceed'
assert styled['nodes']==artist['nodes'], 'Node positioning changed — do not proceed'
assert styled['scenes']==artist['scenes'], 'Scene positioning changed — do not proceed'
for k in ('accessors','bufferViews','buffers','cameras','skins','animations'):
    assert styled.get(k)==artist.get(k), k

# Remove active references, leaving the original mesh objects in glTF for
# archival recovery. No node transforms, mesh geometry or face indices change.
scene=styled['scenes'][styled.get('scene',0)]
archived_nodes=[]
for idx in list(scene['nodes']):
    if styled['nodes'][idx].get('name') in STAGING_ROOTS:
        scene['nodes'].remove(idx)
        archived_nodes.append(styled['nodes'][idx]['name'])
removed_cover=[]
for node in styled['nodes']:
    if 'children' not in node:continue
    for child in list(node['children']):
        if styled['nodes'][child].get('name') in PROTRUDING_COVER:
            node['children'].remove(child)
            removed_cover.append(styled['nodes'][child]['name'])
assert set(archived_nodes)==STAGING_ROOTS,archived_nodes
assert set(removed_cover)==PROTRUDING_COVER,removed_cover

rng=np.random.default_rng(20261021)
S=256
xx,yy=np.meshgrid(np.arange(S),np.arange(S),indexing='xy')

def pattern(kind):
    fine=rng.normal(0,1,(S,S))
    seed=rng.integers(0,256,(48,48),dtype=np.uint8)
    coarse=np.asarray(Image.fromarray(seed).resize((S,S),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(.7)),dtype=np.float32)
    coarse=(coarse-128)/40
    if kind=='brushed_metal':
        stripe=rng.normal(0,1,S).astype('float32')
        lum=242+fine*1.5+stripe[None,:]*2.5+coarse*1.0
    elif kind=='seat_fabric':
        weave=((xx%6)==0).astype(float)*-2+((yy%6)==0).astype(float)*-2
        lum=246+weave+coarse*1.6+fine*1.8
    elif kind=='rubber_floor':
        tread=((xx+yy)%26<3).astype(float)*-4+((xx-yy)%26<3).astype(float)*-3
        lum=246+coarse*2+fine*2+tread
    elif kind=='matte_polymer':
        lum=246+coarse*1.5+fine*3
    elif kind=='wall_vinyl':
        lum=245+coarse*2+fine*1.8
    else:  # fine powder coat
        lum=245+coarse*1.5+fine*2
    img=np.uint8(np.clip(lum,0,255))
    base=Image.fromarray(np.repeat(img[...,None],3,axis=2),'RGB')
    # Tiny tangent-space micro-normal: these are intentionally subtle.
    h=Image.fromarray(np.uint8(np.clip((lum-235)*10+110,0,255))).filter(ImageFilter.GaussianBlur(.75))
    hh=np.array(h,dtype=np.float32)/255
    dy,dx=np.gradient(hh)
    strength={'seat_fabric':7,'rubber_floor':9,'wall_vinyl':4,'brushed_metal':3}.get(kind,5)
    normal=np.stack([128-dx*strength,128-dy*strength,np.full_like(hh,254)],axis=2)
    normal=Image.fromarray(np.uint8(np.clip(normal,0,255)),'RGB')
    return base,normal

maps={};normal_maps={}
material_kind={
 'console':'powder_coat','cab_wall':'wall_vinyl','cab_roof':'wall_vinyl',
 'cab_frame':'brushed_metal','console_trim':'brushed_metal','steel':'brushed_metal',
 'seat_frame':'brushed_metal','seat':'seat_fabric','floor':'rubber_floor',
 'black_plastic':'matte_polymer','console_dark':'matte_polymer',
 'dial_bezel':'brushed_metal','dial_face':'matte_polymer',
 'white_button':'matte_polymer','red_button':'matte_polymer',
 'green_button':'matte_polymer','amber_button':'matte_polymer',
 'lamp_amber':'matte_polymer',
}
styles={}
for i,m in enumerate(styled['materials']):
    if m['name'].startswith('TRAINEX_PBR_'):
        styles[i]=m['name'][len('TRAINEX_PBR_'):]

binary=bytearray(original_binary)
assert styled['buffers'][0]['byteLength']<=len(binary)

def append(data:bytes):
    while len(binary)%4:binary.append(0)
    offset=len(binary)
    binary.extend(data)
    return offset,len(data)

def view(data:bytes, target=None):
    ofs,l=append(data)
    entry={'buffer':0,'byteOffset':ofs,'byteLength':l}
    if target:entry['target']=target
    idx=len(styled['bufferViews']);styled['bufferViews'].append(entry)
    return idx

def embed_texture(kind,is_normal=False):
    mode='normal' if is_normal else 'albedo'
    key=(kind,mode)
    if key in maps:return maps[key]
    surface,normal=pattern_cache[kind]
    pic=normal if is_normal else surface
    name=f'{kind}_{mode}.png';path=TEXTURES/name;pic.save(path)
    data=path.read_bytes()
    v=view(data)
    image_index=len(styled.setdefault('images',[]))
    styled['images'].append({'name':f'TRAINEX_{kind}_{mode}','bufferView':v,'mimeType':'image/png'})
    sampler_idx=len(styled.setdefault('samplers',[]))
    styled['samplers'].append({'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497})
    t_idx=len(styled.setdefault('textures',[]))
    styled['textures'].append({'name':f'TRAINEX_{kind}_{mode}','sampler':sampler_idx,'source':image_index})
    maps[key]=t_idx
    return t_idx

pattern_cache={k:pattern(k) for k in sorted(set(material_kind.values()))}
mat_processed=set()
style_stats=Counter()
for mat_idx,sty in styles.items():
    kind=material_kind.get(sty)
    if not kind:continue
    mat=styled['materials'][mat_idx]
    pbr=mat.setdefault('pbrMetallicRoughness',{})
    if 'baseColorTexture' in pbr:continue
    pbr['baseColorTexture']={'index':embed_texture(kind)}
    if kind in ('seat_fabric','rubber_floor','wall_vinyl','brushed_metal','powder_coat'):
        mat['normalTexture']={'index':embed_texture(kind,True),'scale':{'seat_fabric':.28,'rubber_floor':.34,'wall_vinyl':.12,'brushed_metal':.07,'powder_coat':.10}[kind]}
    mat_processed.add(mat_idx)
    style_stats[sty]+=1

# Generate planar UV from original POSITION accessor, append only TEXCOORD_0.
# Never touch original POSITION/index accessors or the original BIN prefix.
comp_types={5126:np.float32}
def positions_for_primitive(primitive):
    pos_idx=primitive['attributes'].get('POSITION')
    if pos_idx is None:return None
    accessor=styled['accessors'][pos_idx]
    if accessor.get('componentType')!=5126 or accessor.get('type')!='VEC3':return None
    bv=styled['bufferViews'][accessor['bufferView']]
    offset=bv.get('byteOffset',0)+accessor.get('byteOffset',0)
    count=accessor['count'];stride=bv.get('byteStride',12)
    return np.ndarray((count,3),dtype='<f4',buffer=original_binary,offset=offset,strides=(stride,4)).copy()

created_uv=0
for mesh in styled['meshes']:
    for prim in mesh['primitives']:
        mid=prim.get('material')
        if mid not in mat_processed or 'TEXCOORD_0' in prim['attributes']:continue
        points=positions_for_primitive(prim)
        if points is None:continue
        spans=np.ptp(points,axis=0)
        axes=np.argsort(spans)[-2:]
        # Physical-looking repeating pattern; for tiny pushbuttons use a full swatch.
        scale=max(.18,min(1.0,float(max(spans[axes]))*.22))
        uv=points[:,axes].astype(np.float32)/scale
        if not np.all(np.isfinite(uv)):continue
        idx=view(uv.astype('<f4').tobytes(),target=34962)
        a={'bufferView':idx,'byteOffset':0,'componentType':5126,'count':len(points),'type':'VEC2','min':uv.min(axis=0).tolist(),'max':uv.max(axis=0).tolist()}
        aid=len(styled['accessors']);styled['accessors'].append(a)
        prim['attributes']['TEXCOORD_0']=aid
        created_uv+=1

while len(binary)%4:binary.append(0)
styled['buffers'][0]['byteLength']=len(binary)
js=json.dumps(styled,ensure_ascii=False,separators=(',',':')).encode()
js+=b' '*((-len(js))%4)
raw=b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(binary))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(binary),b'BIN\0')+bytes(binary)
TARGET.parent.mkdir(parents=True,exist_ok=True);TARGET.write_bytes(raw)

# Positional/mesh equivalence (allow new TEXCOORD_0 and added material refs ONLY).
final,_=parse_glb(TARGET)
assert len(final['nodes'])==len(artist['nodes']) and len(final['meshes'])==len(artist['meshes'])
for prev,next_ in zip(artist['nodes'],final['nodes']):
    assert {k:v for k,v in prev.items() if k!='children'}=={k:v for k,v in next_.items() if k!='children'},f'Node or transform changed: {prev.get("name")}'
assert bytes(binary[:len(original_binary)])==original_binary,'Vertex bytes changed'
for a,b in zip(artist['meshes'],final['meshes']):
    assert len(a['primitives'])==len(b['primitives'])
    for x,y in zip(a['primitives'],b['primitives']):
        assert x.get('indices')==y.get('indices')
        assert x['attributes']['POSITION']==y['attributes']['POSITION']
        for k in set(x['attributes']):assert x['attributes'][k]==y['attributes'][k]
assert not any(idx in final['scenes'][0]['nodes'] for idx,n in enumerate(final['nodes']) if n.get('name') in STAGING_ROOTS)
manifest={
 'source_blend_sha256':hashlib.sha256((OUTROOT/'blender/cabin/Trainex-Driver Cabin Model 01 - ORIGINAL.blend').read_bytes()).hexdigest(),
 'source_glb_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
 'repaired_glb_sha256':hashlib.sha256(raw).hexdigest(),
 'original_mesh_count':len(artist['meshes']),
 'repaired_mesh_count':len(final['meshes']),
 'original_node_count':len(artist['nodes']),
 'repaired_node_count':len(final['nodes']),
 'source_geometry_bytes_unchanged':True,
 'source_node_transforms_unchanged':True,
 'archived_duplicate_root_nodes_hidden':archived_nodes,
 'mispositioned_upper_front_wall_parts_hidden':removed_cover,
 'material_categories_textured':dict(style_stats),
 'generated_uv_accessors':created_uv,
 'added_embedded_image_textures':len(maps),
 'original_controls_and_console_retained':True,
 'blender_master_source_unchanged':True,
}
(OUTROOT/'exports/manifests/repair-report.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))
