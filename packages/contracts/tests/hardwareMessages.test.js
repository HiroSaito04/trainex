import test from 'node:test';
import assert from 'node:assert/strict';
import { validateHardwareInput, makeHardwareFeedback } from '../src/index.js';
test('hardware messages require device, control and sequence', () => {
 assert.equal(validateHardwareInput({ deviceId: 'dev-1', sequence: 1, controlId: 'DOORS_CLOSE' }).valid, true);
 assert.equal(validateHardwareInput({ deviceId: 'dev-1', sequence: -1, controlId: 'DOORS_CLOSE' }).valid, false);
});

test('feedback carries separate visual, buzzer and penalty flags to the ESP32', () => {
 const feedback=makeHardwareFeedback({speed:26,allDoorsClosed:true,emergencyBrake:false,vigilanceWarning:true,vigilanceBuzzer:true,vigilanceTrip:false});
 assert.equal(feedback.type,'state_feedback');
 assert.equal(feedback.vigilanceWarning,true);
 assert.equal(feedback.vigilanceBuzzer,true);
 assert.equal(feedback.vigilanceTrip,false);
});
