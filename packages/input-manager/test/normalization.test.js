import test from 'node:test';
import assert from 'node:assert/strict';
import { createInputManager } from '../src/index.js';
const setup = () => {
  const commands = [];
  const manager = createInputManager({
    getSessionId: () => 'test-session',
    dispatchCommand: cmd => { commands.push(cmd); return { accepted: true }; },
  });
  return { manager, commands };
};
test('2D master handle is normalized and forwarded', async () => {
  const { manager, commands } = setup();
  assert.deepEqual(await manager.submit({ source: '2d', type: 'MASTER_HANDLE_SET', value: 'P3' }), { accepted: true });
  assert.deepEqual(commands[0], { source: '2d', type: 'MASTER_HANDLE_SET', value: 'P3', sessionId: 'test-session' });
});
test('keyboard maps to the same command', async () => {
  const { manager, commands } = setup();
  await manager.submit({ source: 'keyboard', key: 't' });
  assert.equal(commands[0].type, 'MASTER_HANDLE_SET');
  assert.equal(commands[0].value, 'P3');
});
test('pointer maps to a door command', async () => {
  const { manager, commands } = setup();
  await manager.submit({ source: 'pointer', controlId: 'DOORS_OPEN' });
  assert.equal(commands[0].type, 'DOOR_OPEN_REQUEST');
});
