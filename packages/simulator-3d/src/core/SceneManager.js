import { frameCabin } from '../scene/CameraManager.js';
export function mountCabinScene(scene,camera,controls, model) {
  scene.add(model);
  model.updateMatrixWorld(true);
  const initialView = frameCabin(camera,controls,model);
  return { initialView };
}
