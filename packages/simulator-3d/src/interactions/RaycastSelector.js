import * as THREE from 'three';
import { resolveObjectAction, resolveComponentId, DETENTS } from '../config/objectMappings.js';
function boundedStep(current,dy){
 const index=DETENTS.indexOf(current);
 return DETENTS[Math.max(0,Math.min(DETENTS.length-1,(index<0?4:index)-Math.round(dy/20)))];
}
/** In-cab pointer picker. Drag shaft forward/up to increase power, rear/down to brake. */
export function createRaycastSelector({element,camera,scene,onSelect,onMasterDetent,onMasterPreview,onMasterEnd,getMasterPosition,lookController}){
 const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let press=null;
 function hit(e){
  const rect=element.getBoundingClientRect();if(!rect.width||!rect.height)return null;
  pointer.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
  raycaster.setFromCamera(pointer,camera);
  const intersection=raycaster.intersectObjects(scene.children,true).find(i=>resolveComponentId(i.object));
  return intersection?.object??null;
 }
 function down(e){if(e.button!==0||press)return;
  const obj=hit(e),action=resolveObjectAction(obj);
  const master=action?.kind==='select';
  if(master){lookController?.suspend();onMasterPreview?.(getMasterPosition?.()??'N');element.setPointerCapture?.(e.pointerId);e.stopImmediatePropagation?.();}
  press={id:e.pointerId,x:e.clientX,y:e.clientY,object:obj,master,start:getMasterPosition?.()??'N',preview:null};
 }
 function move(e){
  if(press?.id===e.pointerId&&press.master){
   const next=boundedStep(press.start,e.clientY-press.y);
   if(press.preview!==next){press.preview=next;onMasterPreview?.(next);}
   element.style.cursor='ns-resize';return;
  }
  element.style.cursor=hit(e)?'pointer':'grab';
 }
 function up(e){if(!press||press.id!==e.pointerId)return;
  const p=press;press=null;
  if(p.master){
   const moved=Math.hypot(e.clientX-p.x,e.clientY-p.y);
   const value=moved>8?(p.preview??p.start):null;
   if(value&&value!==p.start)onMasterDetent?.(value);
   else onMasterEnd?.();
   if(element.hasPointerCapture?.(e.pointerId))element.releasePointerCapture(e.pointerId);
   return;
  }
  if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>7)return;
  const obj=hit(e);if(obj)onSelect?.(obj);
 }
 function cancel(){if(press?.master)onMasterEnd?.();press=null;}
 // Capture phase ensures shaft drag disables camera look before its pointerdown handler.
 element.addEventListener('pointerdown',down,true);
 element.addEventListener('pointermove',move);
 element.addEventListener('pointerup',up);
 element.addEventListener('pointercancel',cancel);
 return()=>{element.removeEventListener('pointerdown',down,true);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',up);element.removeEventListener('pointercancel',cancel);element.style.cursor='';};
}
