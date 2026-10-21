import * as THREE from 'three';
import { findSceneObjects, TARGET_OBJECTS } from '../config/objectMappings.js';
import { CABIN_ANIMATION } from '../config/cabinConfig.js';

function needlePivot(root, needleName, dialName) {
  const needle = findSceneObjects(root, needleName)[0];
  const dial = findSceneObjects(root, dialName)[0];
  if (!needle || !dial) return null;
  root.updateWorldMatrix(true, true);
  const dialBox = new THREE.Box3().setFromObject(dial);
  const centerWorld = dialBox.getCenter(new THREE.Vector3());
  const parent = needle.parent;
  const pivotPosition = parent.worldToLocal(centerWorld.clone());
  const originPosition = needle.position.clone();
  const originQuaternion = needle.quaternion.clone();
  const group = new THREE.Group();
  group.position.copy(pivotPosition);
  group.name = `PIVOT_${needleName}`;
  parent.add(group);
  group.attach(needle);
  return {
    needle, group, parent, originPosition, originQuaternion,
    setAngle(angle) { group.rotation.z = angle; },
    setVisible(value) { needle.visible = value; },
    dispose() {
      parent.attach(needle);
      needle.position.copy(originPosition);
      needle.quaternion.copy(originQuaternion);
      needle.visible = true;
      parent.remove(group);
    },
  };
}

// Current engine supplies speed, but does NOT supply pneumatic pressures.
// Pressure needles remain hidden unless actual numeric pressure state exists.
export function createGaugeAnimation(scene) {
  const speed = needlePivot(scene, TARGET_OBJECTS.SPEED_NEEDLE, TARGET_OBJECTS.SPEED_DIAL);
  const cylinder = needlePivot(scene, TARGET_OBJECTS.BRAKE_CYLINDER_NEEDLE, TARGET_OBJECTS.BRAKE_CYLINDER_DIAL);
  const pipe = needlePivot(scene, TARGET_OBJECTS.BRAKE_PIPE_NEEDLE, TARGET_OBJECTS.BRAKE_PIPE_DIAL);
  function updatePressure(gauge, value, max) {
    if (!gauge) return;
    const valid = Number.isFinite(value) && value >= 0;
    gauge.setVisible(valid);
    if (valid) gauge.setAngle(-2.1 + 4.2 * Math.min(value/max,1));
  }
  return {
    count: [speed,cylinder,pipe].filter(Boolean).length,
    setState(state) {
      if (speed) {
        const kmh = state?.speed;
        const valid = Number.isFinite(kmh) && kmh >= 0;
        speed.setVisible(valid);
        if (valid) {
          const { maxKmh,minAngle,maxAngle } = CABIN_ANIMATION.speedometer;
          speed.setAngle(minAngle + Math.min(kmh/maxKmh,1)*(maxAngle-minAngle));
        }
      }
      updatePressure(cylinder, state?.brakeCylinderPressureKpa ?? state?.pressures?.brakeCylinderKpa,1000);
      updatePressure(pipe, state?.brakePipePressureKpa ?? state?.pressures?.brakePipeKpa,1000);
    },
    dispose() { [speed,cylinder,pipe].forEach(g => g?.dispose()); },
  };
}
