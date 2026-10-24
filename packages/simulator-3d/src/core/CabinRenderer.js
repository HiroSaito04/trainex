import * as THREE from 'three';
import { createCabinScene } from '../scene/createCabinScene.js';
import { createCamera } from '../scene/CameraManager.js';
import { loadCabinModel } from '../loaders/CabinModelLoader.js';
import { createFirstPersonController } from '../interactions/FirstPersonController.js';
import { createObjectInteractionManager } from '../interactions/ObjectInteractionManager.js';
import { createTrainStateSynchronizer } from '../synchronization/TrainStateSynchronizer.js';
import { startRenderLoop } from './RenderLoop.js';

export function createCabinRenderer({container,modelUrl,onPicked,onReady,onMasterDetent}){
 if(!container)throw new Error('Cabin viewport missing.');
 const scene=createCabinScene(),camera=createCamera();
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.tabIndex=0;
 renderer.domElement.setAttribute('aria-label','Interactive TRAINEX driver cabin. Drag to look; WASD to move inside; click controls, drag master lever.');
 renderer.domElement.setAttribute('role','application');
 container.append(renderer.domElement);
 const look=createFirstPersonController({camera,element:renderer.domElement});
 let model=null,sync=null,disposed=false,state=null;
 let cleanupPicking=()=>{},stopRender=()=>{},observer;
 let prev=performance.now();
 const resize=()=>{if(disposed)return;const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false)};
 resize();
 if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(container)}else window.addEventListener('resize',resize);
 stopRender=startRenderLoop(()=>{const now=performance.now(),dt=(now-prev)/1000;prev=now;look.update(dt);renderer.render(scene,camera)});
 function disposeModel(root){root.traverse(node=>{if(!node.isMesh)return;node.geometry?.dispose();const materials=Array.isArray(node.material)?node.material:[node.material];for(const m of materials){if(!m)continue;for(const k of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'])m[k]?.dispose?.();m.dispose()}})}
 const api={
  setTrainState(next){state=next;sync?.update(next)},
  previewMaster(position){sync?.previewMaster(position)},
  resetCamera(){look.reset()},
  setMoveDirection(direction,active){look.setMoveDirection(direction,active)},
  step(direction){look.step(direction)},
  // Previous integration API: both views stay inside the physical cab.
  setCameraMode(){look.reset()},
  dispose(){if(disposed)return;disposed=true;observer?.disconnect();window.removeEventListener('resize',resize);stopRender();cleanupPicking();sync?.dispose();look.dispose();if(model){scene.remove(model);disposeModel(model);model=null;}renderer.dispose();renderer.domElement.remove()},
 };
 api.ready=loadCabinModel(modelUrl).then(root=>{
  if(disposed){disposeModel(root);return api;}
  model=root;
  // Hide duplicated, unassembled archive roots in the earlier GLB export. The actual artist geometry and transforms stay untouched.
  const duplicateRoots=new Set(['MasterController.001','Floor.001','MiddlePanel.001','RIghtBottomCompartment.001','CommunicationsRadioControlPanel.001','StorageDistributionBoardPanel.006','DistributionBoardPanel.001']);
  for(const child of root.children)if(duplicateRoots.has(child.name))child.visible=false;
  // The original authoring file also has three upper 'FrontWall' pieces protruding
  // beyond the ceiling. Hide only these misplaced meshes, without moving the cab.
  const protrudingCover=new Set(['FrontWall','FrontWall.001','FrontWall.002']);
  root.traverse(node=>{if(protrudingCover.has(node.name))node.visible=false;});
  root.traverse(node=>{if(node.isMesh){node.castShadow=!node.name.includes('Glass')&&!node.name.includes('DigitalFace');node.receiveShadow=true;
   if(node.material){const mats=Array.isArray(node.material)?node.material:[node.material];for(const m of mats){if(!m)continue;if(node.name.includes('Glass')){m.transparent=true;m.opacity=Math.min(.26,m.opacity??1);m.depthWrite=false;m.roughness=.1;}}}
  }});
  scene.add(root);root.updateMatrixWorld(true);
  // Artist-owned GLB: no geometry, labels, buttons or material meshes are added.
  root.updateMatrixWorld(true);
  sync=createTrainStateSynchronizer(root,camera.position);sync.update(state);
  cleanupPicking=createObjectInteractionManager({element:renderer.domElement,camera,scene,
   onSelect:obj=>onPicked?.(obj),
   onMasterDetent:value=>Promise.resolve(onMasterDetent?.(value)).finally(()=>{sync?.endPreview();sync?.update(state)}),
   onMasterEnd:()=>sync?.endPreview(),
   onMasterPreview:value=>sync?.previewMaster(value),
   getMasterPosition:()=>{const s=state?.display??state;return s?.masterHandle??'N'},
   lookController:look,
  });
  onReady?.(sync.matched);return api;
 }).catch(err=>{api.dispose();throw err});
 return api;
}
