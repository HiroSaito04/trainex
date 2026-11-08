import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../src/index.js';

test('service braking reduces speed and never reverses the train', () => {
  const engine = createEngine();
  engine.startSession();
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3' });
  engine.step(8);
  const speed = engine.getState().speed;
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'B3' });
  engine.step(2);
  assert.ok(engine.getState().speed < speed);
  engine.step(12);
  assert.equal(engine.getState().speed, 0);
  assert.ok(engine.getState().distanceMeters > 0);
});

test('coasting decreases positive train speed gradually', () => {
  const engine = createEngine();
  engine.startSession();
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3' });
  engine.step(5);
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'N' });
  const before = engine.getState().speed;
  engine.step(1);
  assert.ok(engine.getState().speed < before);
  assert.ok(engine.getState().speed > 0);
});
