import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CABIN_MODEL_URL } from '../config/cabinConfig.js';

export async function loadCabinModel(url = CABIN_MODEL_URL) {
  try {
    const gltf = await new GLTFLoader().loadAsync(url);
    if (!gltf.scene) throw new Error('GLB did not contain a scene.');
    return gltf.scene;
  } catch (cause) {
    throw new Error(`Could not load TRAINEX GLB at ${url}. Run the Blender export and npm run sync:models.`, { cause });
  }
}
