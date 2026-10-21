import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../src/index.js';

test('session lifecycle starts, pauses, resumes, resets, ends', () => {
  const engine = createEngine();
  assert.equal(engine.getSessionStatus(), 'IDLE');
  assert.equal(engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3' }).accepted, false);
  assert.equal(engine.startSession({ sessionId: 'train-01' }).accepted, true);
  engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3', sessionId: 'train-01' });
  engine.step(2);
  assert.ok(engine.getState().speed > 0);
  assert.equal(engine.pauseSession().accepted, true);
  const state = engine.getState();
  assert.equal(engine.step(2), false);
  assert.equal(engine.getState(), state);
  assert.equal(engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'N' }).accepted, false);
  assert.equal(engine.resumeSession().accepted, true);
  engine.step(1);
  assert.ok(engine.getState().speed > state.speed);
  assert.equal(engine.resetSession().accepted, true);
  assert.equal(engine.getSessionStatus(), 'PAUSED');
  assert.equal(engine.getState().speed, 0);
  assert.equal(engine.resumeSession().accepted, true);
  assert.equal(engine.endSession().accepted, true);
  assert.equal(engine.getSessionStatus(), 'ENDED');
});

test('stale session and invalid command are rejected', () => {
  const engine = createEngine();
  engine.startSession({ sessionId: 'a' });
  assert.equal(engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'P3', sessionId: 'b' }).accepted, false);
  assert.equal(engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'INVALID' }).accepted, false);
  assert.equal(engine.getState().masterHandle, 'N');
});
