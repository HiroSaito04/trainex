import * as THREE from 'three';
import { resolveObjectAction, DETENTS } from '../config/objectMappings.js';

export function boundedMasterDetent(current,verticalDrag){
 const index=DETENTS.indexOf(current);
 return DETENTS[Math.max(0,Math.min(DETENTS.length-1,(index<0?4:index)-Math.round(verticalDrag/20)))];
}

/**
 * Only objects with an actual simulator command intercept touch gestures.
 * Otherwise the gesture is passed to the first-person camera controller.
 */
export function createRaycastSelector({element,camera,scene,onSelect,onMasterDetent,onMasterPreview,onMasterEnd,getMasterPosition,lookController}){
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 let press=null;
 function hit(e){
  const rect=element.getBoundingClientRect();
  if(rect.width<=0||rect.height<=0)return null;
  pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  return raycaster.intersectObjects(scene.children,true).find(intersection=>resolveObjectAction(intersection.object))?.object??null;
 }
 function down(e){
  if(e.pointerType!=='touch'&&e.button!==0)return;
  if(press)return;
  const object=hit(e);
  if(!object)return;
  const action=resolveObjectAction(object);
  const master=action?.kind==='select';
  press={id:e.pointerId,x:e.clientX,y:e.clientY,object,master,start:getMasterPosition?.()??'N',preview:null};
  lookController?.suspend();
  element.setPointerCapture?.(e.pointerId);
  // The camera controller listens in bubbling phase; stop the pointerdown
  // so a mobile button tap never starts a camera-look gesture.
  e.stopImmediatePropagation?.();
  if(master)onMasterPreview?.(press.start);
 }
 function move(e){
  if(press?.id===e.pointerId){
   if(press.master){
    const next=boundedMasterDetent(press.start,e.clientY-press.y);
    if(press.preview!==next){press.preview=next;onMasterPreview?.(next);}
    element.style.cursor='ns-resize';
   }
   return;
  }
  if(e.pointerType==='mouse')element.style.cursor=hit(e)?'pointer':'grab';
 }
 function up(e){
  if(press?.id!==e.pointerId)return;
  const p=press;press=null;
  if(element.hasPointerCapture?.(e.pointerId))element.releasePointerCapture(e.pointerId);
  const distance=Math.hypot(e.clientX-p.x,e.clientY-p.y);
  if(p.master){
   const next=distance>9?(p.preview??p.start):null;
   if(next&&next!==p.start)onMasterDetent?.(next);
   else onMasterEnd?.();
  }else if(distance<12){
   onSelect?.(p.object);
  }
  element.style.cursor='grab';
 }
 function cancel(){if(press?.master)onMasterEnd?.();press=null;element.style.cursor='grab';}
 element.addEventListener('pointerdown',down,true);
 element.addEventListener('pointermove',move);
 element.addEventListener('pointerup',up);
 element.addEventListener('pointercancel',cancel);
 return()=>{
  element.removeEventListener('pointerdown',down,true);
  element.removeEventListener('pointermove',move);
  element.removeEventListener('pointerup',up);
  element.removeEventListener('pointercancel',cancel);
  element.style.cursor='';
 };
}
