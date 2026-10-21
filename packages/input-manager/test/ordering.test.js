import test from 'node:test';
import assert from 'node:assert/strict';
import { createInputManager } from '../src/index.js';
test('hardware dedupe rejects a replay', async () => {
  let count = 0;
  const manager = createInputManager({ getSessionId: () => 'S1', dispatchCommand: () => { count++; return { accepted: true }; } });
  const event = { source: 'hardware', deviceId: 'dev', controlId: 'DOORS_OPEN', sequence: 2 };
  assert.equal((await manager.submit(event)).accepted, true);
  assert.equal((await manager.submit(event)).accepted, false);
  assert.equal(count, 1);
});
test('async dispatch preserves submission order', async () => {
  const forwarded = [];
  const manager = createInputManager({ getSessionId: () => 'S1', dispatchCommand: async command => {
    await Promise.resolve(); forwarded.push(command.type); return { accepted: true };
  } });
  await Promise.all([
    manager.submit({ source: '2d', type: 'DOOR_OPEN_REQUEST' }),
    manager.submit({ source: '2d', type: 'DOOR_CLOSE_REQUEST' }),
  ]);
  assert.deepEqual(forwarded, ['DOOR_OPEN_REQUEST', 'DOOR_CLOSE_REQUEST']);
});
