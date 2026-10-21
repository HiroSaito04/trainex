import * as THREE from 'three';
import { CAMERA_CONFIG } from '../config/cameraConfig.js';
export function clampCabinPosition(position,bounds=CAMERA_CONFIG.bounds){
 for(const axis of ['x','y','z'])position[axis]=THREE.MathUtils.clamp(position[axis],...bounds[axis]);
 return position;
}
/** Drag to look 360°, WASD and wheel to move; strict interior collision bounds. */
export function createFirstPersonController({camera,element}){
 const cfg=CAMERA_CONFIG;
 const initial=new THREE.Vector3(...cfg.driverPosition);
 const target=new THREE.Vector3(...cfg.driverTarget);
 const initialDir=target.clone().sub(initial).normalize();
 let yaw=Math.atan2(-initialDir.x,-initialDir.z);
 let pitch=Math.asin(initialDir.y);
 const startYaw=yaw,startPitch=pitch;
 let active=null;
 let keys=new Set();
 let disposed=false;
 const forward=new THREE.Vector3();
 const delta=new THREE.Vector3();
 const onChange=()=>{
  forward.set(-Math.sin(yaw)*Math.cos(pitch), Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
  camera.lookAt(camera.position.clone().add(forward));
 };
 function reset(){camera.position.copy(initial);clampCabinPosition(camera.position);yaw=startYaw;pitch=startPitch;onChange();}
 function down(e){if(e.button!==0||active!==null)return;active={id:e.pointerId,x:e.clientX,y:e.clientY};element.setPointerCapture?.(e.pointerId);element.focus();}
 function move(e){if(!active||active.id!==e.pointerId)return;const dx=e.clientX-active.x,dy=e.clientY-active.y;active.x=e.clientX;active.y=e.clientY;
  yaw-=dx*cfg.lookSensitivity;pitch=THREE.MathUtils.clamp(pitch+dy*cfg.lookSensitivity,-cfg.pitchLimit,cfg.pitchLimit);onChange();}
 function end(e){if(active?.id!==e.pointerId)return;active=null;if(element.hasPointerCapture?.(e.pointerId))element.releasePointerCapture(e.pointerId);}
 function wheel(e){e.preventDefault();const step=THREE.MathUtils.clamp(-e.deltaY*.0015,-.35,.35);moveForward(step);}
 function moveForward(amount){forward.set(-Math.sin(yaw)*Math.cos(pitch),0,-Math.cos(yaw)*Math.cos(pitch)).normalize();camera.position.addScaledVector(forward,amount);clampCabinPosition(camera.position);onChange();}
 function keydown(e){if(!['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))return;e.preventDefault();keys.add(e.code);}
 function keyup(e){keys.delete(e.code);}
 function update(dt){if(disposed||!keys.size)return;const speed=cfg.moveSpeed*Math.min(dt,.05);const front=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));delta.set(0,0,0);
  if(keys.has('KeyW')||keys.has('ArrowUp'))delta.add(front);
  if(keys.has('KeyS')||keys.has('ArrowDown'))delta.sub(front);
  if(keys.has('KeyD')||keys.has('ArrowRight'))delta.add(right);
  if(keys.has('KeyA')||keys.has('ArrowLeft'))delta.sub(right);
  if(delta.lengthSq()>0){delta.normalize().multiplyScalar(speed);camera.position.add(delta);clampCabinPosition(camera.position);onChange();}
 }
 element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);element.addEventListener('pointerup',end);element.addEventListener('pointercancel',end);
 element.addEventListener('wheel',wheel,{passive:false});element.addEventListener('keydown',keydown);element.addEventListener('keyup',keyup);
 element.addEventListener('blur',()=>keys.clear());reset();
 return {reset,update,moveForward, suspend(){active=null;},dispose(){disposed=true;element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',end);element.removeEventListener('pointercancel',end);element.removeEventListener('wheel',wheel);element.removeEventListener('keydown',keydown);element.removeEventListener('keyup',keyup);keys.clear();}};
}
