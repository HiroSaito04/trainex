import * as THREE from 'three';
import {findSceneObjects,TARGET_OBJECTS} from '../config/objectMappings.js';
function makeLamp(root,name,onColor){
 const nodes=findSceneObjects(root,name).filter(n=>n.isMesh);
 const entries=nodes.map(node=>{
  const old=node.material,materials=(Array.isArray(old)?old:[old]).map(mat=>mat.clone());
  node.material=Array.isArray(old)?materials:materials[0];
  return {node,old,materials};
 });
 return {count:nodes.length,setLit(lit){for(const {materials} of entries)for(const mat of materials){if(!mat.emissive)continue;mat.emissive.set(lit?onColor:'#000000');mat.emissiveIntensity=lit?2.0:0;mat.needsUpdate=true;}},dispose(){for(const {node,old,materials} of entries){node.material=old;materials.forEach(m=>m.dispose());}}};
}
export function createIndicatorAnimation(root){
 const closed=makeLamp(root,TARGET_OBJECTS.DOOR_LAMP_CAP,'#ffd700');
 const opened=makeLamp(root,TARGET_OBJECTS.DOOR_OPEN_LAMP,'#3de7aa');
 return {count:closed.count+opened.count,setState(allClosed,doorState){closed.setLit(allClosed===true);opened.setLit(doorState==='OPEN');},dispose(){closed.dispose();opened.dispose()}};
}
// Live display is applied directly to the 3D panel mesh, never as a floating HUD.
function canvasSurface(root,name,width,height,painter){
 const nodes=findSceneObjects(root,name).filter(n=>n.isMesh);
 if(!nodes.length||typeof document==='undefined')return {count:0,update(){},dispose(){}};
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');if(!ctx)return {count:0,update(){},dispose(){}};
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.flipY=false;
 const records=nodes.map(node=>{
  const old=node.material,materials=(Array.isArray(old)?old:[old]).map(original=>{
   const m=original.clone();m.map=tex;m.color?.set('#ffffff');m.emissive?.set('#ffffff');m.emissiveMap=tex;m.emissiveIntensity=.45;m.transparent=false;m.needsUpdate=true;return m;});
  node.material=Array.isArray(old)?materials:materials[0];return {node,old,materials};
 });
 let key='';
 return {count:nodes.length,update(state){const next=JSON.stringify([state?.speed,state?.masterHandle,state?.doorState,state?.allDoorsClosed,state?.emergencyBrake,state?.brakeCylinderPressureKpa,state?.brakePipePressureKpa]);if(key===next)return;key=next;painter(ctx,width,height,state??{});tex.needsUpdate=true;},dispose(){for(const {node,old,materials} of records){node.material=old;materials.forEach(m=>m.dispose());}tex.dispose()}};
}
function text(ctx,content,x,y,font,color){ctx.font=font;ctx.fillStyle=color;ctx.fillText(content,x,y)}
function drawMain(ctx,w,h,state){
 ctx.fillStyle='#07121c';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#8f9ca8';ctx.fillRect(0,78,w,2);
 text(ctx,'TRAINEX  /  DRIVER INFORMATION DISPLAY',34,58,'bold 26px sans-serif','#ffd700');
 text(ctx,'CURRENT SPEED',35,127,'21px sans-serif','#a6bbcc');
 text(ctx,Number.isFinite(state.speed)?state.speed.toFixed(1):'--.-',32,286,'bold 135px monospace','#f7fcff');
 text(ctx,'km/h',485,267,'bold 30px sans-serif','#f1d657');
 ctx.fillStyle='#152636';ctx.fillRect(31,315,706,95);
 text(ctx,'MASTER HANDLE  '+(state.masterHandle??'---'),46,348,'bold 23px monospace','#e9eef4');
 text(ctx,'DOORS: '+(state.doorState??'---'),46,389,'bold 23px monospace',state.allDoorsClosed?'#86f5ae':'#e9eef4');
 text(ctx,'EB: '+(state.emergencyBrake?'ACTIVE':'CLEAR'),485,389,'bold 21px monospace',state.emergencyBrake?'#ff7e82':'#eff3f8');
}
function drawReadout(ctx,w,h,title,value,unit){
 ctx.fillStyle='#081218';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#b5bbc2';ctx.strokeRect(3,3,w-6,h-6);
 text(ctx,title,14,30,'bold 22px sans-serif','#e9d376');
 text(ctx,value,14,90,'bold 54px monospace','#f5fafb');
 text(ctx,unit,w-95,90,'21px sans-serif','#bdc5c9');
}
export function createFrontPanelAnimation(root){
 const main=canvasSurface(root,TARGET_OBJECTS.DISPLAY_GRAPHIC,768,440,drawMain);
 const speed=canvasSurface(root,TARGET_OBJECTS.SPEED_DIGITAL,300,120,(ctx,w,h,s)=>drawReadout(ctx,w,h,'SPEED',Number.isFinite(s.speed)?s.speed.toFixed(1):'--.-','km/h'));
 const cylinder=canvasSurface(root,TARGET_OBJECTS.BRAKE_CYLINDER_DIGITAL,300,120,(ctx,w,h,s)=>drawReadout(ctx,w,h,'BRAKE CYLINDER',Number.isFinite(s.brakeCylinderPressureKpa)?Math.round(s.brakeCylinderPressureKpa)+'':'---','kPa'));
 const pipe=canvasSurface(root,TARGET_OBJECTS.BRAKE_PIPE_DIGITAL,300,120,(ctx,w,h,s)=>drawReadout(ctx,w,h,'BRAKE PIPE',Number.isFinite(s.brakePipePressureKpa)?Math.round(s.brakePipePressureKpa)+'':'---','kPa'));
 const all=[main,speed,cylinder,pipe];
 return {count:all.reduce((n,p)=>n+p.count,0),setState(state){all.forEach(p=>p.update(state))},dispose(){all.forEach(p=>p.dispose())}};
}
