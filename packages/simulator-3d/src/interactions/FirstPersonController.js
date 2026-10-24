import * as THREE from 'three';
import { CAMERA_CONFIG } from '../config/cameraConfig.js';

export const CAB_DIRECTIONS=Object.freeze(['forward','backward','left','right']);
export function clampCabinPosition(position,bounds=CAMERA_CONFIG.bounds){
 for(const axis of ['x','y','z'])position[axis]=THREE.MathUtils.clamp(position[axis],...bounds[axis]);
 return position;
}

/**
 * Camera only; never submits train inputs.
 * Desktop: drag to look, WASD/arrows to walk, wheel to move.
 * Touch: one-finger look, two-finger pinch to move, hold the onscreen D-pad.
 * The raycast control picker intercepts physical-control taps in capture phase.
 */
export function createFirstPersonController({camera,element}){
 const cfg=CAMERA_CONFIG;
 const initial=new THREE.Vector3(...cfg.driverPosition);
 const initialDir=new THREE.Vector3(...cfg.driverTarget).sub(initial).normalize();
 let yaw=Math.atan2(-initialDir.x,-initialDir.z);
 let pitch=Math.asin(initialDir.y);
 const startYaw=yaw,startPitch=pitch;
 let active=null, lastPinchDistance=null, disposed=false;
 const touchPointers=new Map(), keys=new Set(), virtualDirections=new Set();
 const forward=new THREE.Vector3(),delta=new THREE.Vector3();
 function orient(){
  forward.set(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
  camera.lookAt(camera.position.clone().add(forward));
 }
 function reset(){
  camera.position.copy(initial);clampCabinPosition(camera.position);
  yaw=startYaw;pitch=startPitch;keys.clear();virtualDirections.clear();active=null;
  touchPointers.clear();lastPinchDistance=null;orient();
 }
 const pinchDistance=()=>{
  const pts=[...touchPointers.values()];
  return pts.length<2?null:Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);
 };
 function down(e){
  if(disposed || (e.pointerType!=='touch'&&e.button!==0))return;
  element.focus({preventScroll:true});
  element.setPointerCapture?.(e.pointerId);
  if(e.pointerType==='touch'){
   touchPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(touchPointers.size===2){active=null;lastPinchDistance=pinchDistance();return;}
  }
  if(active!==null)return;
  active={id:e.pointerId,x:e.clientX,y:e.clientY};
 }
 function move(e){
  if(disposed)return;
  if(touchPointers.has(e.pointerId)){
   touchPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(touchPointers.size>=2){
    const distance=pinchDistance();
    if(lastPinchDistance!==null&&distance!==null){moveForward(THREE.MathUtils.clamp((distance-lastPinchDistance)*.005,-.12,.12));}
    lastPinchDistance=distance;return;
   }
  }
  if(active?.id!==e.pointerId)return;
  const dx=e.clientX-active.x,dy=e.clientY-active.y;
  active.x=e.clientX;active.y=e.clientY;
  yaw-=dx*cfg.lookSensitivity;
  pitch=THREE.MathUtils.clamp(pitch+dy*cfg.lookSensitivity,-cfg.pitchLimit,cfg.pitchLimit);
  orient();
 }
 function end(e){
  touchPointers.delete(e.pointerId);
  if(touchPointers.size<2)lastPinchDistance=null;
  if(active?.id===e.pointerId)active=null;
  // After pinching, require a new pointerdown to begin looking again.
  if(touchPointers.size===1 && active!==null)active=null;
  if(element.hasPointerCapture?.(e.pointerId))element.releasePointerCapture(e.pointerId);
 }
 function moveForward(amount){
  const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  camera.position.addScaledVector(f,amount);clampCabinPosition(camera.position);orient();
 }
 function wheel(e){e.preventDefault();moveForward(THREE.MathUtils.clamp(-e.deltaY*.0015,-.35,.35));}
 const keyboard=Object.freeze({KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'});
 function keydown(e){
  if(!keyboard[e.code] || e.repeat && keys.has(e.code))return;
  if(document.activeElement!==element)return;
  e.preventDefault();keys.add(e.code);
 }
 function keyup(e){keys.delete(e.code);}
 function release(){keys.clear();virtualDirections.clear();active=null;touchPointers.clear();lastPinchDistance=null;}
 function setMoveDirection(direction,enabled){
  if(!CAB_DIRECTIONS.includes(direction))return;
  if(enabled)virtualDirections.add(direction);else virtualDirections.delete(direction);
 }
 function getMoveVector(direction){
  const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  const r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  if(direction==='forward')return f;
  if(direction==='backward')return f.multiplyScalar(-1);
  if(direction==='right')return r;
  if(direction==='left')return r.multiplyScalar(-1);
  return new THREE.Vector3();
 }
 function step(direction){
  if(!CAB_DIRECTIONS.includes(direction))return;
  camera.position.addScaledVector(getMoveVector(direction),.09);
  clampCabinPosition(camera.position);orient();
 }
 function update(dt){
  if(disposed)return;
  delta.set(0,0,0);
  const directions=new Set(virtualDirections);
  for(const key of keys){if(keyboard[key])directions.add(keyboard[key]);}
  for(const direction of directions)delta.add(getMoveVector(direction));
  if(delta.lengthSq()>0){
   delta.normalize().multiplyScalar(cfg.moveSpeed*Math.min(Math.max(0,dt),.05));
   camera.position.add(delta);clampCabinPosition(camera.position);orient();
  }
 }
 element.addEventListener('pointerdown',down);
 element.addEventListener('pointermove',move);
 element.addEventListener('pointerup',end);
 element.addEventListener('pointercancel',end);
 element.addEventListener('lostpointercapture',end);
 element.addEventListener('wheel',wheel,{passive:false});
 element.addEventListener('keydown',keydown);
 window.addEventListener('keyup',keyup);
 window.addEventListener('blur',release);
 document.addEventListener('visibilitychange',release);
 reset();
 return {
  reset,update,moveForward,step,setMoveDirection,
  suspend(){active=null;lastPinchDistance=null;},
  dispose(){
   disposed=true;release();
   element.removeEventListener('pointerdown',down);
   element.removeEventListener('pointermove',move);
   element.removeEventListener('pointerup',end);
   element.removeEventListener('pointercancel',end);
   element.removeEventListener('lostpointercapture',end);
   element.removeEventListener('wheel',wheel);
   element.removeEventListener('keydown',keydown);
   window.removeEventListener('keyup',keyup);
   window.removeEventListener('blur',release);
   document.removeEventListener('visibilitychange',release);
  },
 };
}
