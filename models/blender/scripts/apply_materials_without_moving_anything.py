"""TRAINEX: apply subtle PBR materials to the currently open artist .blend file.

Run via Blender 5.1+ Text Editor -> Open -> Run Script, after opening
models/blender/cabin/Trainex-Driver Cabin Model 01.blend.

This script NEVER creates/removes/moves objects, changes a mesh's vertices,
renames collections, modifies a camera, or changes transforms.
It saves a NEW file, leaving the uploaded original untouched.
"""
import bpy
from pathlib import Path

PALETTE = {
    'walls': ('BDC3C6', .83, .02, .055),
    'roof': ('9DA6AB', .77, .04, .05),
    'frames': ('838C94', .48, .35, .045),
    'console': ('4D565F', .72, .09, .065),
    'trim': ('8A949E', .38, .55, .025),
    'floor': ('343D42', .96, .00, .12),
    'seat': ('2E3841', .90, .00, .15),
    'plastic': ('2B3035', .75, .02, .05),
    'red': ('BE2634', .34, .03, .04),
    'green': ('18875D', .35, .02, .045),
    'amber': ('D2A22C', .35, .02, .05),
    'steel': ('A5ADB2', .34, .64, .027),
    'dial': ('252B32', .87, .02, .015),
}
def linear(c):
    c=c / 255.0
    return c / 12.92 if c < .04045 else ((c+.055)/1.055)**2.4

def pbr_material(key):
    name='TRAINEX | '+key.upper()
    mat=bpy.data.materials.get(name)
    if mat: return mat
    hx,rough,metal,grain=PALETTE[key]
    mat=bpy.data.materials.new(name)
    mat.diffuse_color=tuple(linear(int(hx[i:i+2],16)) for i in (0,2,4))+(1,)
    mat.use_nodes=True
    mat.node_tree.nodes.clear()
    nodes=mat.node_tree.nodes
    links=mat.node_tree.links
    output=nodes.new('ShaderNodeOutputMaterial');output.location=(500,0)
    shader=nodes.new('ShaderNodeBsdfPrincipled');shader.location=(150,0)
    shader.inputs['Base Color'].default_value=mat.diffuse_color
    shader.inputs['Roughness'].default_value=rough
    shader.inputs['Metallic'].default_value=metal
    links.new(shader.outputs['BSDF'],output.inputs['Surface'])
    noise=nodes.new('ShaderNodeTexNoise');noise.location=(-450,-230)
    noise.inputs['Scale'].default_value=145 if key not in ('floor','seat') else 70
    noise.inputs['Detail'].default_value=2.0
    noise.inputs['Roughness'].default_value=.55
    bump=nodes.new('ShaderNodeBump');bump.location=(-150,-170)
    bump.inputs['Strength'].default_value=min(grain, .15)
    bump.inputs['Distance'].default_value=.004
    links.new(noise.outputs['Fac'],bump.inputs['Height'])
    links.new(bump.outputs['Normal'],shader.inputs['Normal'])
    return mat

def classify(name):
    n=name.lower().replace('\n','_').replace(' ','_')
    # Preserve existing image-based screens; the browser supplies live content.
    if 'screengraphic' in n or 'radio_smallscreen' in n:return None
    if 'window' in n and 'glass' in n:return None
    if any(s in n for s in ('seat','cushion','upholstery','headrest')):return 'seat'
    if any(s in n for s in ('floor','footwell','rubbermat')):return 'floor'
    if any(s in n for s in ('wall','bulkhead')):return 'walls'
    if any(s in n for s in ('roof','ceiling')):return 'roof'
    if any(s in n for s in ('beam','cab_frame','windowframe','pillar')):return 'frames'
    if 'emergencybrake_cap' in n or 'door_close_cap' in n:return 'red'
    if 'door_open_cap' in n or 'vigilance_cap' in n:return 'green'
    if 'horn_cap' in n or 'door_lock_cap' in n:return 'amber'
    if any(s in n for s in ('dial','speed_bezel','bc_bezel','bp_bezel')):return 'dial'
    if any(s in n for s in ('master_controller_shaft','reverser_shaft','grip','metal','lever')):return 'steel'
    if any(s in n for s in ('_rim','_bezel','guideframe','cabinet_trim','cab_selection')):return 'trim'
    if any(s in n for s in ('desk','panel','tcms','shell','cabinet','cab_')):return 'console'
    return None

# Check that no existing transforms or mesh topology can change silently.
originals={obj.name:(tuple(round(v,9) for row in obj.matrix_world for v in row),
                    len(obj.data.vertices) if obj.type=='MESH' else None)
           for obj in bpy.data.objects}
count=0
for obj in bpy.data.objects:
    if obj.type != 'MESH': continue
    kind=classify(obj.name)
    if kind is None: continue
    # Some source meshes are linked across objects. Copy only the datablock
    # before assigning material slots, not any vertex positions.
    if obj.data.users>1:obj.data=obj.data.copy()
    mats=obj.data.materials
    mats.clear()
    mats.append(pbr_material(kind))
    count += 1
for obj in bpy.data.objects:
    transform,vertex_count=originals[obj.name]
    assert tuple(round(v,9) for row in obj.matrix_world for v in row)==transform, obj.name
    assert (len(obj.data.vertices) if obj.type=='MESH' else None)==vertex_count, obj.name

source=Path(bpy.data.filepath)
assert source.suffix.lower()=='.blend', 'Open the original .blend before running.'
output=source.with_name(source.stem+' - MATERIALS ONLY.blend')
bpy.ops.wm.save_as_mainfile(filepath=str(output),copy=True)
print(f'TRAINEX: applied materials to {count} EXISTING mesh objects. No transforms, vertices, or object names changed.')
print('Saved NEW Blender project:',output)
