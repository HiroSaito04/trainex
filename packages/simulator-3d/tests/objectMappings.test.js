import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveObjectAction, resolveComponentId, COMPONENTS } from '../src/config/objectMappings.js';
const node = (name, parent = null, userData={}) => ({name,parent,userData});
test('both left and right door OPEN meshes map to shared engine command', () => {
  for (const side of ['Left','Right']) {
    assert.equal(resolveObjectAction(node(`INTERACTIVE_${side}Door_Open_Cap`)).type,'DOOR_OPEN_REQUEST');
  }
});
test('door CLOSE and numbered variants map correctly', () => {
  assert.equal(resolveObjectAction(node('INTERACTIVE_RightDoor_Close_Cap.001')).type,'DOOR_CLOSE_REQUEST');
});
test('emergency cap maps to engine activation, while shaft selects master control', () => {
  assert.equal(resolveObjectAction(node('INTERACTIVE_EmergencyBrake_Cap')).type,'EMERGENCY_BRAKE_ACTIVATE');
  assert.equal(resolveObjectAction(node('INTERACTIVE_Master_Controller_Shaft.001')).kind,'select');
});
test('only metadata or verified names identify indicators', () => {
  assert.equal(resolveComponentId(node('anything',null,{trainex_component_id:'ALL_DOORS_CLOSED_LAMP'})),COMPONENTS.LAMP);
  assert.equal(resolveComponentId(node('INDICATOR_AllDoorsClosed_Lamp')),COMPONENTS.LAMP);
  assert.equal(resolveComponentId(node('something-else')),null);
});
test('nested meshes inherit control name', () => {
  const parent = node('INTERACTIVE_LeftDoor_Open_Cap');
  assert.equal(resolveObjectAction(node('Mesh_0',parent)).type, 'DOOR_OPEN_REQUEST');
});
