import { findSceneObjects, TARGET_OBJECTS } from '../config/objectMappings.js';
// Button travel is visual only. Door timing/interlocks belong to engine.
export function createDoorControlAnimation(scene) {
  const open = [TARGET_OBJECTS.LEFT_DOOR_OPEN, TARGET_OBJECTS.RIGHT_DOOR_OPEN]
    .flatMap(name => findSceneObjects(scene,name));
  const close = [TARGET_OBJECTS.LEFT_DOOR_CLOSE, TARGET_OBJECTS.RIGHT_DOOR_CLOSE]
    .flatMap(name => findSceneObjects(scene,name));
  const original = new Map([...open,...close].map(node => [node,node.position.clone()]));
  return {
    count: open.length+close.length,
    setState(doorState) {
      for (const node of [...open,...close]) {
        node.position.copy(original.get(node));
        if ((doorState === 'OPENING' && open.includes(node)) ||
            (doorState === 'CLOSING' && close.includes(node))) node.position.y -= 0.008;
      }
    },
    dispose() { for (const [node,p] of original) node.position.copy(p); },
  };
}
