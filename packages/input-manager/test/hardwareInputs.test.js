import test from 'node:test';
import assert from 'node:assert/strict';
import { createInputManager } from '../src/index.js';
test('hardware maps to canonical master position', async () => {
  const forwarded = [];
  const manager = createInputManager({ getSessionId: () => 'S1', dispatchCommand: cmd => { forwarded.push(cmd); return { accepted: true }; } });
  const result = await manager.submit({ source: 'hardware', deviceId: 'dev', sequence: 1, controlId: 'MASTER_HANDLE', value: 'B3' });
  assert.equal(result.accepted, true);
  assert.equal(forwarded[0].source, 'hardware');
  assert.equal(forwarded[0].value, 'B3');
});
