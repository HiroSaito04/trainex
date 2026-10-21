import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../src/index.js';

test('door request transitions through opening / open / closing / closed', () => {
  const engine = createEngine();
  engine.startSession();
  assert.equal(engine.sendCommand({ type: 'DOOR_OPEN_REQUEST' }).accepted, true);
  assert.equal(engine.getState().doorState, 'OPENING');
  engine.step(3);
  assert.equal(engine.getState().doorState, 'OPEN');
  assert.equal(engine.sendCommand({ type: 'DOOR_CLOSE_REQUEST' }).accepted, true);
  engine.step(3.5);
  assert.equal(engine.getState().doorState, 'CLOSED');
});

test('door opening is rejected while moving and door closure is not instantaneous', () => {
  const engine = createEngine();
  engine.startSession();
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3' });
  engine.step(3);
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'N' });
  assert.equal(engine.sendCommand({ type: 'DOOR_OPEN_REQUEST' }).accepted, false);
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'B3' });
  engine.step(10);
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'N' });
  engine.sendCommand({ type: 'DOOR_OPEN_REQUEST' });
  engine.step(3);
  engine.sendCommand({ type: 'DOOR_CLOSE_REQUEST' });
  assert.equal(engine.getState().allDoorsClosed, false);
  engine.step(0.5);
  assert.equal(engine.getState().allDoorsClosed, false);
});
