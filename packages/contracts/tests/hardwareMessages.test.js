import test from 'node:test';
import assert from 'node:assert/strict';
import { validateHardwareInput } from '../src/index.js';
test('hardware messages require device, control and sequence', () => {
 assert.equal(validateHardwareInput({ deviceId: 'dev-1', sequence: 1, controlId: 'DOORS_CLOSE' }).valid, true);
 assert.equal(validateHardwareInput({ deviceId: 'dev-1', sequence: -1, controlId: 'DOORS_CLOSE' }).valid, false);
});
