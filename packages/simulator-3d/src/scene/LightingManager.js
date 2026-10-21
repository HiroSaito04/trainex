import * as THREE from 'three';
// Warm directional sun entering through the windshield and side windows.
export function addCabinLighting(scene){
 scene.add(new THREE.HemisphereLight('#e7f2ff','#4b4b47',1.35));
 const sun=new THREE.DirectionalLight('#fff0cd',3.25);
 sun.name='CAB_SUNLIGHT';sun.position.set(-9,10,-12);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;
 sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.camera.near=.1;sun.shadow.camera.far=40;
 sun.shadow.bias=-.00012;sun.shadow.normalBias=.018;sun.target.position.set(0,1.2,0);
 scene.add(sun,sun.target);
 const bounce=new THREE.DirectionalLight('#b4cbe7',.65);bounce.position.set(1.0,2.6,2.9);scene.add(bounce);
 const panel=new THREE.PointLight('#ffebba',.5,4.5,2);panel.position.set(0,2.35,.25);scene.add(panel);
 return {sun};
}
