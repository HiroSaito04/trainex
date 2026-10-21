import * as THREE from 'three';
import { CAMERA_CONFIG } from '../config/cameraConfig.js';
export function createCamera(){return new THREE.PerspectiveCamera(CAMERA_CONFIG.fov,1,CAMERA_CONFIG.near,CAMERA_CONFIG.far)}
export function driverView(camera,controller){ controller?.reset?.();return {position:camera.position.clone(),center:new THREE.Vector3(...CAMERA_CONFIG.driverTarget)};}
// Kept for old SceneManager imports; does NOT position camera outside.
export const frameCabin=driverView;
export const overviewView=driverView;
