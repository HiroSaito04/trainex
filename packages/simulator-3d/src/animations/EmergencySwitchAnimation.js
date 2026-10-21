import { findSceneObjects, TARGET_OBJECTS } from '../config/objectMappings.js';
export function createEmergencySwitchAnimation(scene) {
  const nodes = findSceneObjects(scene, TARGET_OBJECTS.EMERGENCY_CAP);
  const original = nodes.map(n => n.position.clone());
  return {
    count: nodes.length,
    setState(active) {
      nodes.forEach((node,i) => {
        node.position.copy(original[i]);
        if (active === true) node.position.y -= 0.014;
      });
    },
    dispose() { nodes.forEach((node,i) => node.position.copy(original[i])); },
  };
}
