import * as THREE from 'three';
import {DETENTS,TARGET_OBJECTS,findSceneObjects} from '../config/objectMappings.js';

function canvasText(lines,{bg='#22252a',fg='#f7f6ef',accent='#d1ac4d',width=256,height=110}={}){
 const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');
 ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);ctx.strokeStyle=accent;ctx.lineWidth=4;ctx.strokeRect(3,3,width-6,height-6);
 const values=Array.isArray(lines)?lines:[lines];const fontSize=Math.min(57,Math.floor(height/(values.length+0.8)));
 ctx.fillStyle=fg;ctx.textBaseline='middle';ctx.textAlign='center';ctx.font=`bold ${fontSize}px system-ui`;
 values.forEach((t,i)=>ctx.fillText(t,width/2,height*(i+1)/(values.length+1),width-14));
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function localFromWorld(root,v){return root.worldToLocal(v.clone())}
function labelMesh(name,texture,w,h){const mat=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,transparent:false,depthWrite:true});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);mesh.name=name;mesh.userData.trainex_overlay=true;return mesh;}
function find(root,name){return findSceneObjects(root,name).find(n=>n.isMesh)}
function boundsOf(mesh){return new THREE.Box3().setFromObject(mesh)}
/** Does not change or move any mesh from the supplied Blender file. */
export function addInCabAttachments(root,viewCamera){
 if(typeof document==='undefined')return {dispose(){},readouts:{}};
 root.updateMatrixWorld(true);
 const owned=[];const readouts={};const rot=viewCamera.quaternion.clone();
 function attach(mesh,world){mesh.position.copy(localFromWorld(root,world));mesh.quaternion.copy(root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rot));root.add(mesh);owned.push(mesh);return mesh;}
 const shaft=find(root,TARGET_OBJECTS.MASTER_SHAFT);
 const guide=findSceneObjects(root,'05_Driver_Controls__Master_Controller_GuideInset').find(x=>x.isMesh);
 if(shaft){
  const center=boundsOf(shaft).getCenter(new THREE.Vector3());const guideBounds=guide?boundsOf(guide):boundsOf(shaft);
  const width=Math.max(.085,Math.min(.14,guideBounds.getSize(new THREE.Vector3()).x*.30));
  const spread=Math.max(.38,Math.min(.85,guideBounds.getSize(new THREE.Vector3()).z*1.2));
  // Plaques lie along the physical front/rear travel lane, just to the right.
  const x=Math.min(guideBounds.max.x+.10,center.x+.20);const y=guideBounds.max.y+.013;
  const z=(guideBounds.min.z+guideBounds.max.z)/2;
  for(let i=0;i<DETENTS.length;i++){
   const position=DETENTS[i];const texture=canvasText(position,{width:130,height:115,bg:position==='EB'?'#80192b':'#25262b',accent:position==='N'?'#dbb84a':'#707880'});
   const plaque=labelMesh(`INTERACTIVE_Master_Detent_${position}`,texture,width,spread/8*.82);
   // Horizontal desk labels: plane local normal +Z -> world +Y.
   plaque.position.copy(localFromWorld(root,new THREE.Vector3(x,y,z+spread/2-(i+.5)*spread/8)));
   plaque.quaternion.copy(root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0))));
   root.add(plaque);owned.push(plaque);
  }
 }
 // Original file may have no reset cap; append in-scene reset next to existing EB.
 if(!find(root,TARGET_OBJECTS.EMERGENCY_RESET)){
  const eb=find(root,TARGET_OBJECTS.EMERGENCY_CAP);
  if(eb){const b=boundsOf(eb);const p=b.getCenter(new THREE.Vector3());
   const radius=Math.max(.023,Math.min(.058,b.getSize(new THREE.Vector3()).x*.45));
   const reset=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,.014,32),new THREE.MeshStandardMaterial({color:'#2d8c65',metalness:.24,roughness:.48}));
   reset.name=TARGET_OBJECTS.EMERGENCY_RESET;reset.position.copy(localFromWorld(root,new THREE.Vector3(p.x+Math.max(.14,radius*3),b.max.y+.016,p.z)));
   root.add(reset);owned.push(reset);
   const tex=canvasText('EB RESET',{width:220,height:90,bg:'#18352d',accent:'#74bb96'});
   const label=labelMesh('DETAIL_EB_Reset_Label',tex,.14,.045);
   label.position.copy(localFromWorld(root,new THREE.Vector3(p.x+Math.max(.14,radius*3),b.max.y+.035,p.z-.09)));
   label.quaternion.copy(root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0))));
   root.add(label);owned.push(label);
  }
 }
 // The user's source may not include a separate OPEN lamp. Add only the display overlay,
 // within the existing front panel, without changing the uploaded mesh.
 if(!find(root,TARGET_OBJECTS.DOOR_OPEN_LAMP)){
  const closed=find(root,TARGET_OBJECTS.DOOR_LAMP_CAP);
  if(closed){const b=boundsOf(closed),c=b.getCenter(new THREE.Vector3()),size=b.getSize(new THREE.Vector3());
   const rad=Math.max(.018,Math.min(.055,Math.max(size.x,size.y,size.z)*.4));
   const lamp=new THREE.Mesh(new THREE.SphereGeometry(rad,20,16),new THREE.MeshStandardMaterial({color:'#1c553c',emissive:'#000000',emissiveIntensity:0,roughness:.46}));
   lamp.name=TARGET_OBJECTS.DOOR_OPEN_LAMP;
   lamp.position.copy(localFromWorld(root,new THREE.Vector3(c.x+rad*3.1,c.y,c.z)));
   root.add(lamp);owned.push(lamp);
   const tex=canvasText('DOORS OPEN',{width:240,height:80,bg:'#25362f',accent:'#7ac59c'});
   const label=labelMesh('DETAIL_Doors_Open_Label',tex,rad*5.6,rad*1.6);
   const labelWorld=new THREE.Vector3(c.x+rad*3.1,c.y-rad*2.4,c.z);
   attach(label,labelWorld);
  }
 }
 // Instrument faces sit on their corresponding dial, never off-panel or in a HUD.
 const gaugeSpecs=[
  ['speed',TARGET_OBJECTS.SPEED_DIAL],
  ['cylinder',TARGET_OBJECTS.BRAKE_CYLINDER_DIAL],
  ['pipe',TARGET_OBJECTS.BRAKE_PIPE_DIAL]
 ];
 for(const [key,target] of gaugeSpecs){
  const dial=find(root,target);if(!dial)continue;
  const box=boundsOf(dial),ctr=box.getCenter(new THREE.Vector3()),ext=box.getSize(new THREE.Vector3());
  const diameter=Math.max(.05,Math.min(.35,Math.max(ext.x,ext.y,ext.z)*.93));
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=labelMesh('DISPLAY_'+key.toUpperCase()+'_DIAL',texture,diameter,diameter);
  const toward=viewCamera.position.clone().sub(ctr).normalize();
  attach(mesh,ctr.addScaledVector(toward,.014));readouts[key]={canvas,ctx:canvas.getContext('2d'),texture};
 }
 // TCMS main panel content is anchored to physical screen's bounds.
 const graphic=find(root,TARGET_OBJECTS.DISPLAY_GRAPHIC);
 if(graphic){const box=boundsOf(graphic);const c=box.getCenter(new THREE.Vector3()),e=box.getSize(new THREE.Vector3());
  const size=[e.x,e.y,e.z].sort((a,b)=>b-a);const w=Math.max(.18,size[0]*.84),h=Math.max(.10,size[1]*.82);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=620;
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const mesh=labelMesh('DISPLAY_MAIN_DRIVER_PANEL',tex,w,h);
  attach(mesh,c.addScaledVector(viewCamera.position.clone().sub(c).normalize(),.016));readouts.main={canvas,ctx:canvas.getContext('2d'),texture:tex};
 }
 return {readouts,dispose(){for(const mesh of owned){root.remove(mesh);mesh.geometry.dispose();const material=mesh.material;material.map?.dispose?.();material.dispose();}}};
}
