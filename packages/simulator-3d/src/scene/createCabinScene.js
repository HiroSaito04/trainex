import * as THREE from 'three';
import { addCabinLighting } from './LightingManager.js';
export function createCabinScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#11151b');
  addCabinLighting(scene);
  return scene;
}
