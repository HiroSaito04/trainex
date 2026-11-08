import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../src/index.js';

test('traction increases speed only when all doors are closed', () => {
  const engine = createEngine();
  engine.startSession({ sessionId: 'S1' });
  assert.equal(engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3' }).accepted, true);
  engine.step(4);
  assert.ok(engine.getState().speed > 8);
  assert.equal(engine.getState().display.masterHandle, 'P3');
});

test('cannot select traction with open doors', () => {
  const engine = createEngine();
  engine.startSession();
  engine.sendCommand({ type: 'DOOR_OPEN_REQUEST' });
  assert.equal(engine.getState().allDoorsClosed, false);
  assert.equal(engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3' }).accepted, false);
});
