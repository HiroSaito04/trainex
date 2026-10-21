import * as THREE from 'three';
import {findSceneObjects,TARGET_OBJECTS} from '../config/objectMappings.js';

/**
 * Original-dial aligned readouts. Artwork is drawn at each *visible* mesh's local
 * center on the surface plane. It is NOT a free-floating heads-up display.
 * The only changing values come from the shared Simulation Engine.
 */
function canvas(w,h){const e=document.createElement('canvas');e.width=w;e.height=h;return e;}
function text(ctx,value,x,y,size,color='#f5f8f9',weight=500){
 ctx.font=`${weight} ${size}px Arial, sans-serif`;
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;
 ctx.fillText(String(value),x,y);
}
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
function ring(ctx,w,h,{major=12,minor=5}={}){
 const cx=w/2,cy=h/2,r=Math.min(w,h)*.465;
 ctx.clearRect(0,0,w,h);
 ctx.fillStyle='#333538';ctx.fillRect(0,0,w,h);
 ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
 ctx.fillStyle='#393b3e';ctx.fill();ctx.lineWidth=14;ctx.strokeStyle='#0b0d0e';ctx.stroke();
 // Arc opens at bottom. The exact angles are shared by tick marks and needle.
 const first=Math.PI*.78,span=Math.PI*1.44;
 for(let i=0;i<=major*minor;i++){
  const a=first+i/(major*minor)*span;
  const strong=i%minor===0;
  const inn=r*(strong?.77:.87),out=r*.96;
  ctx.beginPath();ctx.moveTo(cx+inn*Math.cos(a),cy+inn*Math.sin(a));
  ctx.lineTo(cx+out*Math.cos(a),cy+out*Math.sin(a));
  ctx.strokeStyle='#eef0f0';ctx.lineWidth=strong?5.5:2.6;ctx.stroke();
 }
 return {cx,cy,r,first,span};
}
function needle(ctx,dial,value,max,color){
 if(!Number.isFinite(value))return;
 const {cx,cy,r,first,span}=dial;
 const angle=first+clamp(value/max,0,1)*span;
 ctx.beginPath();ctx.moveTo(cx-Math.cos(angle)*r*.10,cy-Math.sin(angle)*r*.10);
 ctx.lineTo(cx+Math.cos(angle)*r*.68,cy+Math.sin(angle)*r*.68);
 ctx.lineCap='round';ctx.strokeStyle=color;ctx.lineWidth=9;ctx.stroke();
 ctx.beginPath();ctx.arc(cx,cy,r*.084,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
}
function readSpeed(ctx,w,h,s){
 const dial=ring(ctx,w,h,{major:12,minor:4});
 const {cx,cy,r,first,span}=dial;
 for(let i=0;i<24;i++){
  const a=first+(i/23)*span;
  ctx.beginPath();ctx.arc(cx,cy,r*.90,a,a+.020);
  ctx.lineWidth=9;ctx.strokeStyle=i<6?'#e63e49':'#21a974';ctx.stroke();
 }
 const permit=Number.isFinite(s.permittedSpeedKmh)?s.permittedSpeedKmh:15;
 const actual=Number.isFinite(s.speed)?s.speed:0;
 text(ctx,'PERMIT SPEED',cx,cy-r*.33,27,'#e5e6e9',500);
 text(ctx,Math.round(permit),cx,cy-r*.12,60,'#f04751',700);
 text(ctx,'CURRENT SPEED',cx,cy+r*.20,26,'#e5e6e9',500);
 text(ctx,actual.toFixed(0),cx,cy+r*.43,64,'#fcfcfd',650);
 text(ctx,'km/h',cx,cy+r*.64,25,'#ececec');
 needle(ctx,dial,actual,120,'#f0d342');
}
function pressure(value,kind){
 const numeric=kind==='cylinder'?(value.brakeCylinderPressureKpa??value.pressures?.brakeCylinderKpa):(value.brakePipePressureKpa??value.pressures?.brakePipeKpa);
 return Number.isFinite(numeric)?numeric:null;
}
function pressureFace(title,kind,color){return (ctx,w,h,s)=>{
 const dial=ring(ctx,w,h,{major:10,minor:4});
 const number=pressure(s,kind);
 const {cx,cy,r}=dial;
 text(ctx,title,cx,cy-r*.36,30,'#f0f0ef',700);
 text(ctx,number===null?'—':Math.round(number),cx,cy+r*.32,70,color,700);
 text(ctx,'kPa',cx,cy+r*.60,29,'#eeeeee',500);
 needle(ctx,dial,number,1000,color);
};}
function mainFace(ctx,w,h,s){
 ctx.clearRect(0,0,w,h);
 ctx.fillStyle='#101820';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#1e2a34';ctx.fillRect(0,0,w,78);
 text(ctx,'TRAINEX   |   DRIVER INFORMATION',w/2,42,29,'#e7edf1',650);
 ctx.strokeStyle='#64717d';ctx.lineWidth=3;ctx.strokeRect(5,5,w-10,h-10);
 ctx.beginPath();ctx.moveTo(w*.54,95);ctx.lineTo(w*.54,h-110);ctx.strokeStyle='#5f6871';ctx.stroke();
 const actual=Number.isFinite(s.speed)?s.speed.toFixed(1):'—';
 text(ctx,'CURRENT SPEED',w*.27,h*.31,33,'#bfcad1',650);
 text(ctx,actual,w*.27,h*.57,127,'#f6f9fa',700);
 text(ctx,'km/h',w*.27,h*.75,29,'#f3d36e',600);
 text(ctx,'MASTER HANDLE',w*.75,h*.27,26,'#c9d4da',600);
 text(ctx,s.masterHandle??'N',w*.75,h*.46,95,'#ffe17c',700);
 text(ctx,'PASSENGER DOORS',w*.75,h*.62,27,'#c4d1d7',600);
 text(ctx,s.allDoorsClosed===true?'CLOSED':(s.doorState??'UNKNOWN'),w*.75,h*.75,43,
   s.allDoorsClosed?'#63e0a3':'#ffca73',700);
 ctx.fillStyle='#28333c';ctx.fillRect(0,h-95,w,95);
 const emergency=s.emergencyBrake===true;
 text(ctx,emergency?'EMERGENCY BRAKE ACTIVE':'EMERGENCY BRAKE CLEAR',w*.5,h-48,32,emergency?'#ff7474':'#8addaf',700);
}
const specs=[
 {node:TARGET_OBJECTS.SPEED_DIAL,w:768,h:768,draw:readSpeed},
 {node:TARGET_OBJECTS.BRAKE_CYLINDER_DIAL,w:640,h:640,draw:pressureFace('BRAKE CYLINDER','cylinder','#eed144')},
 {node:TARGET_OBJECTS.BRAKE_PIPE_DIAL,w:640,h:640,draw:pressureFace('BRAKE PIPE','pipe','#f24752')},
 {node:TARGET_OBJECTS.DISPLAY_GRAPHIC,w:1000,h:620,draw:mainFace},
];

/**
 * Display instrumentation on the artist's EXISTING meshes, not on new planes.
 * For no-UV meshes (round Blender dials), clone the geometry and generate
 * planar UV coordinates for the texture. Vertex positions, indices, transforms,
 * parent relationships, and authored GLB bytes are never edited.
 *
 * The screen is self-lit for legibility even with the cabin sun at odd angles.
 */
function projectedGeometryUV(node,cameraPosition){
 const source=node.geometry;
 if(!source?.attributes?.position)return null;
 node.updateWorldMatrix(true,false);
 const geometry=source.clone();
 const position=geometry.getAttribute('position');
 const center=new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3());
 const facing=cameraPosition.clone().sub(center).normalize();
 if(facing.lengthSq()<.1)facing.set(0,0,1);
 const up=new THREE.Vector3(0,1,0);
 if(Math.abs(facing.dot(up))>.96)up.set(0,0,1);
 const right=new THREE.Vector3().crossVectors(up,facing).normalize();
 const screenUp=new THREE.Vector3().crossVectors(facing,right).normalize();
 const pt=new THREE.Vector3(),uv=new Float32Array(position.count*2);
 let minU=Infinity,maxU=-Infinity,minV=Infinity,maxV=-Infinity;
 for(let i=0;i<position.count;i++){
  pt.fromBufferAttribute(position,i).applyMatrix4(node.matrixWorld);
  const u=pt.dot(right),v=pt.dot(screenUp);
  uv[i*2]=u;uv[i*2+1]=v;
  minU=Math.min(minU,u);maxU=Math.max(maxU,u);
  minV=Math.min(minV,v);maxV=Math.max(maxV,v);
 }
 const width=Math.max(1e-8,maxU-minU),height=Math.max(1e-8,maxV-minV);
 for(let i=0;i<position.count;i++){
  uv[i*2]=(uv[i*2]-minU)/width;
  uv[i*2+1]=(uv[i*2+1]-minV)/height;
 }
 geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 return geometry;
}
function useOriginalFace(node,spec,cameraPosition){
 if(!node.isMesh||!node.geometry)return null;
 const c=canvas(spec.w,spec.h),ctx=c.getContext('2d');
 if(!ctx)return null;
 const geometry=projectedGeometryUV(node,cameraPosition);
 if(!geometry)return null;
 const oldGeometry=node.geometry,oldMaterial=node.material;
 const texture=new THREE.CanvasTexture(c);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=8;
 texture.needsUpdate=true;
 // BasicMaterial makes text legible while preventing PBR sunlight from blacking it out.
 const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});
 node.geometry=geometry;
 node.material=material;
 let previous=null;
 const layer={
  update(state){
   const signature=JSON.stringify([
    state.speed,state.permittedSpeedKmh,state.masterHandle,state.doorState,
    state.allDoorsClosed,state.emergencyBrake,state.brakeCylinderPressureKpa,
    state.brakePipePressureKpa
   ]);
   if(signature===previous)return;
   previous=signature;
   spec.draw(ctx,spec.w,spec.h,state);
   texture.needsUpdate=true;
  },
  dispose(){
   node.geometry=oldGeometry;node.material=oldMaterial;
   geometry.dispose();material.dispose();texture.dispose();
  }
 };
 layer.update({speed:0,masterHandle:'N',doorState:'CLOSED',allDoorsClosed:true,emergencyBrake:false});
 return layer;
}
export function createInstrumentSurfaces(scene,cameraPosition=new THREE.Vector3(0,1.67,1.76)){
 if(typeof document==='undefined')return {count:0,setState(){},dispose(){}};
 scene.updateMatrixWorld(true);
 const layers=specs.map(spec=>{
  const node=findSceneObjects(scene,spec.node).find(n=>n.isMesh);
  return node?useOriginalFace(node,spec,cameraPosition):null;
 }).filter(Boolean);
 return {
  count:layers.length,
  setState(state){for(const layer of layers)layer.update(state??{});},
  dispose(){for(const layer of layers)layer.dispose()},
 };
}
