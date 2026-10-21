"""TRAINEX Blender 5.1: non-destructive original cabin cleanup and material upgrade.

In Blender, open the supplied ORIGINAL .blend, switch to Scripting, open
this script and Run Script. It saves a *new* .blend and leaves the original
untouched. It never changes an object's geometry, rotation or location.

Corrects active display only:
  - 7 archived/unassembled source groups => hidden, not deleted
  - 3 oversized upper FrontWall panels => hidden, not deleted
  - existing visible meshes get physically based, subtle materials
"""
import bpy
import hashlib
from pathlib import Path

STAGING={
    'MasterController.001','Floor.001','MiddlePanel.001',
    'RIghtBottomCompartment.001','CommunicationsRadioControlPanel.001',
    'StorageDistributionBoardPanel.006','DistributionBoardPanel.001',
}
COVER={'FrontWall','FrontWall.001','FrontWall.002'}
PALETTE={
    'powdercoat':('45535D',.75,.08,.018),
    'wall':('B4BCC0',.78,.02,.010),
    'roof':('919CA5',.75,.05,.012),
    'steel':('A4B0BA',.34,.68,.006),
    'plastic':('29323A',.67,.02,.014),
    'rubber':('272F33',.90,.0,.04),
    'fabric':('35414A',.93,.0,.05),
    'red':('C52D35',.34,.04,.012),
    'green':('16875E',.35,.03,.011),
    'amber':('D9A938',.36,.02,.010),
    'white':('C9D2D9',.43,.03,.012),
    'dial':('272D33',.88,.0,.012),
}

def srgb_to_linear(v):
    x=int(v,16)/255.0
    return x/12.92 if x<0.04045 else ((x+.055)/1.055)**2.4

def material(kind):
    name=f'TRAINEX_REALISTIC_{kind}'
    m=bpy.data.materials.get(name)
    if m:return m
    hx,rough,metal,grain=PALETTE[kind]
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    m.diffuse_color=tuple(srgb_to_linear(hx[i:i+2]) for i in (0,2,4))+(1,)
    nodes=m.node_tree.nodes;nodes.clear();links=m.node_tree.links
    out=nodes.new('ShaderNodeOutputMaterial');out.location=(440,0)
    bsdf=nodes.new('ShaderNodeBsdfPrincipled');bsdf.location=(120,0)
    bsdf.inputs['Base Color'].default_value=m.diffuse_color
    bsdf.inputs['Roughness'].default_value=rough
    bsdf.inputs['Metallic'].default_value=metal
    links.new(bsdf.outputs['BSDF'],out.inputs['Surface'])
    noise=nodes.new('ShaderNodeTexNoise');noise.location=(-440,-150)
    noise.inputs['Scale'].default_value=200 if kind not in ('fabric','rubber') else 125
    noise.inputs['Detail'].default_value=2.5
    noise.inputs['Roughness'].default_value=.55
    bump=nodes.new('ShaderNodeBump');bump.location=(-120,-150)
    bump.inputs['Strength'].default_value=.13 if kind=='fabric' else .085
    bump.inputs['Distance'].default_value=grain
    links.new(noise.outputs['Fac'],bump.inputs['Height'])
    links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
    return m

def classify(n):
    s=n.lower().replace('\n','_').replace(' ','_')
    if any(t in s for t in ('_screengraphic','radio_smallscreen')):return None
    if 'glass' in s or 'windowpane' in s:return None
    if any(t in s for t in ('seat','cushion','headrest','upholstery')):return 'fabric'
    if 'floor' in s or 'footwell' in s:return 'rubber'
    if any(t in s for t in ('roof','ceiling')):return 'roof'
    if 'wall' in s or 'bulkhead' in s:return 'wall'
    if any(t in s for t in ('brake_cap','emergencybrake_cap','door_close_cap')):return 'red'
    if any(t in s for t in ('door_open_cap','vigilance_cap')):return 'green'
    if any(t in s for t in ('door_lock_cap','horn_cap')):return 'amber'
    if any(t in s for t in ('speed_dial','bc_dial','bp_dial')):return 'dial'
    if any(t in s for t in ('controller_shaft','_grip','master_controller_shaft','reverser_shaft')):return 'steel'
    if any(t in s for t in ('beam','frame','pillar','trim','bezel','rim','lever')):return 'steel'
    if any(t in s for t in ('button','switch')):return 'white'
    if any(t in s for t in ('dark','black','inset','guide','slot','recess')):return 'plastic'
    if any(t in s for t in ('desk','panel','cabinet','shell','tcms','radio')):return 'powdercoat'
    return None

source=Path(bpy.data.filepath)
if not source.exists() or source.suffix.lower()!='.blend':
    raise RuntimeError('Open the artist ORIGINAL .blend in Blender before running this script.')

# Snapshot transforms and all positions, not only vertex counts.
before={o.name: (tuple(round(v,8) for row in o.matrix_world for v in row),
                 tuple((round(v.co.x,8),round(v.co.y,8),round(v.co.z,8)) for v in o.data.vertices) if o.type=='MESH' else None)
        for o in bpy.data.objects}

def hide_recursive(o):
    o.hide_render=True
    o.hide_set(True)
    for child in o.children:hide_recursive(child)

hidden=[]
for name in sorted(STAGING|COVER):
    obj=bpy.data.objects.get(name)
    if obj:
        hide_recursive(obj)
        hidden.append(name)

changed=0
for obj in bpy.data.objects:
    if obj.type!='MESH':continue
    kind=classify(obj.name)
    if not kind:continue
    # Make single-user only when necessary. This copies mesh data and never changes geometry.
    if obj.data.users>1:obj.data=obj.data.copy()
    obj.data.materials.clear()
    obj.data.materials.append(material(kind))
    changed+=1

for obj in bpy.data.objects:
    oldmatrix,oldverts=before[obj.name]
    assert tuple(round(v,8) for row in obj.matrix_world for v in row)==oldmatrix, obj.name
    if oldverts is not None:
        newverts=tuple((round(v.co.x,8),round(v.co.y,8),round(v.co.z,8)) for v in obj.data.vertices)
        assert newverts==oldverts, obj.name

output=source.with_name('Trainex-Driver Cabin Model 01 - CLEAN STRUCTURE & MATERIALS.blend')
bpy.ops.wm.save_as_mainfile(filepath=str(output),copy=True)
print('TRAINEX source preserved:',source)
print('TRAINEX saved editable copy:',output)
print('Archived/incorrect parts hidden (not deleted):',hidden)
print('Existing meshes given PBR materials:',changed)
