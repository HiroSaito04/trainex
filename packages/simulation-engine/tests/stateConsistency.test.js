import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../src/index.js';

test('subscribers receive a single authoritative read-only snapshot', () => {
  const engine = createEngine();
  let notifications = 0;
  const seen = [];
  const unsubscribe = engine.subscribe((state) => { notifications++; seen.push(state); });
  engine.startSession();
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3' });
  engine.step(1);
  assert.equal(notifications, 3);
  assert.equal(seen.at(-1), engine.getState());
  assert.equal(engine.getState().speed, engine.getState().display.speed);
  assert.throws(() => { engine.getState().speed = 999; }, TypeError);
  assert.throws(() => { engine.getState().display.speed = 999; }, TypeError);
  unsubscribe();
  engine.step(1);
  assert.equal(notifications, 3);
});

test('invalid simulation step is rejected', () => {
  const engine = createEngine();
  engine.startSession();
  assert.throws(() => engine.step(-1), RangeError);
  assert.throws(() => engine.step(NaN), RangeError);
});
