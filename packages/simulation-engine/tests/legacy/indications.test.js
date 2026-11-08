import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../src/index.js';

test('all doors closed lamp follows modeled door confirmation, not command submission', () => {
  const engine = createEngine();
  engine.startSession();
  assert.equal(engine.getState().display.allDoorsClosed, true);
  engine.sendCommand({ type: 'DOOR_OPEN_REQUEST' });
  assert.equal(engine.getState().display.allDoorsClosed, false);
  engine.step(3);
  engine.sendCommand({ type: 'DOOR_CLOSE_REQUEST' });
  assert.equal(engine.getState().display.allDoorsClosed, false);
  engine.step(3.1);
  assert.equal(engine.getState().display.allDoorsClosed, true);
});
