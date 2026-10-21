import * as THREE from 'three';
import { CABIN_ANIMATION } from '../config/cabinConfig.js';
import { TARGET_OBJECTS, findSceneObjects } from '../config/objectMappings.js';
// The shaft and grip always move together; the detent labels remain fixed on desk.
export function createMasterHandleAnimation(scene){
 const shaft=findSceneObjects(scene,TARGET_OBJECTS.MASTER_SHAFT)[0];
 const grip=findSceneObjects(scene,TARGET_OBJECTS.MASTER_GRIP)[0];
 const trim=scene.getObjectByName('DETAIL_MasterLever_GripTrim');
 const nodes=[shaft,grip,trim].filter(Boolean);
 if(!shaft)return {count:0,setState(){},dispose(){}};
 scene.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(shaft);
 const pivotWorld=new THREE.Vector3((box.min.x+box.max.x)/2,box.min.y+.008,(box.min.z+box.max.z)/2);
 const parent=shaft.parent;
 const group=new THREE.Group(); group.name='PIVOT_MasterHandle';
 group.position.copy(parent.worldToLocal(pivotWorld.clone())); parent.add(group);
 const old=nodes.map(node=>({node,parent:node.parent}));
 for(const node of nodes) group.attach(node);
 const axis=new THREE.Vector3(1,0,0);
 let current='N';
 return {
  count:nodes.length,
  setState(position){current=CABIN_ANIMATION.masterHandle.angles[position]===undefined?'N':position;group.quaternion.setFromAxisAngle(axis,CABIN_ANIMATION.masterHandle.angles[current]);},
  getState(){return current},
  dispose(){for(const {node,parent} of old)parent.attach(node);group.parent?.remove(group);}
 };
}
