import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../src/index.js';

test('emergency brake overrides active traction and blocks reset in motion', () => {
  const engine = createEngine();
  engine.startSession();
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3' });
  engine.step(4);
  const before = engine.getState().speed;
  assert.equal(engine.sendCommand({ type: 'EMERGENCY_BRAKE_ACTIVATE' }).accepted, true);
  engine.step(0.5);
  assert.ok(engine.getState().speed < before);
  assert.equal(engine.getState().display.emergencyBrake, true);
  assert.equal(engine.sendCommand({ type: 'EMERGENCY_BRAKE_RESET' }).accepted, false);
  assert.equal(engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3' }).accepted, false);
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'N' });
  engine.step(10);
  assert.equal(engine.getState().speed, 0);
  assert.equal(engine.sendCommand({ type: 'EMERGENCY_BRAKE_RESET' }).accepted, true);
  assert.equal(engine.getState().emergencyBrake, false);
});
