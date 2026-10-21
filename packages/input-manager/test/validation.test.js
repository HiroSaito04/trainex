import test from 'node:test';
import assert from 'node:assert/strict';
import { createInputManager } from '../src/index.js';
const make = () => createInputManager({ getSessionId: () => 'S1', dispatchCommand: () => ({ accepted: true }) });
test('rejects bad handle position', async () => assert.equal((await make().submit({ source: '2d', type: 'MASTER_HANDLE_SET', value: 'FLY' })).accepted, false));
test('rejects wrong session', async () => assert.equal((await make().submit({ source: '2d', sessionId: 'S2', type: 'DOOR_OPEN_REQUEST' })).accepted, false));
test('rejects missing hardware sequence', async () => assert.equal((await make().submit({ source: 'hardware', deviceId: 'esp1', controlId: 'DOORS_OPEN' })).accepted, false));
