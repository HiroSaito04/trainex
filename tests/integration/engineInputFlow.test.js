import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '@trainex/simulation-engine';
import { createInputManager } from '@trainex/input-manager';
import { validateTrainState } from '@trainex/contracts';

function setup() {
  const engine = createEngine({ autoTick: false });
  const inputs = createInputManager({
    getSessionId: () => engine.getSessionInfo().sessionId,
    dispatchCommand: command => engine.sendCommand(command),
  });
  assert.equal(engine.startSession().accepted, true);
  return { engine, inputs };
}

test('2D traction and brake change the same authoritative speed', async () => {
  const { engine, inputs } = setup();
  assert.equal((await inputs.submit({ source: '2d', type: 'MASTER_HANDLE_SET', value: 'TRACTION' })).accepted, true);
  engine.step(2);
  assert.ok(engine.getState().speed > 0);
  const afterTraction = engine.getState().speed;
  assert.equal((await inputs.submit({ source: '2d', type: 'MASTER_HANDLE_SET', value: 'BRAKE' })).accepted, true);
  engine.step(1);
  assert.ok(engine.getState().speed < afterTraction);
  assert.equal(validateTrainState(engine.getState()).valid, true);
});

test('door lamp extinguishes on opening request and illuminates only after closing', async () => {
  const { engine, inputs } = setup();
  assert.equal(engine.getState().allDoorsClosed, true);
  assert.equal((await inputs.submit({ source: '2d', type: 'DOOR_OPEN_REQUEST' })).accepted, true);
  assert.equal(engine.getState().allDoorsClosed, false);
  engine.step(3);
  assert.equal(engine.getState().doorState, 'OPEN');
  assert.equal((await inputs.submit({ source: '2d', type: 'DOOR_CLOSE_REQUEST' })).accepted, true);
  assert.equal(engine.getState().allDoorsClosed, false);
  engine.step(3.1);
  assert.equal(engine.getState().doorState, 'CLOSED');
  assert.equal(engine.getState().allDoorsClosed, true);
});

test('emergency brake overrides traction, with reset operating rules', async () => {
  const { engine, inputs } = setup();
  assert.equal((await inputs.submit({ source: '2d', type: 'MASTER_HANDLE_SET', value: 'TRACTION' })).accepted, true);
  engine.step(4);
  const movingSpeed = engine.getState().speed;
  assert.equal((await inputs.submit({ source: '2d', type: 'EMERGENCY_BRAKE_ACTIVATE' })).accepted, true);
  engine.step(0.5);
  assert.ok(engine.getState().speed < movingSpeed);
  assert.equal((await inputs.submit({ source: '2d', type: 'EMERGENCY_BRAKE_RESET' })).accepted, false);
  engine.step(15);
  assert.equal(engine.getState().speed, 0);
  assert.equal((await inputs.submit({ source: '2d', type: 'MASTER_HANDLE_SET', value: 'COAST' })).accepted, true);
  assert.equal((await inputs.submit({ source: '2d', type: 'EMERGENCY_BRAKE_RESET' })).accepted, true);
  assert.equal(engine.getState().emergencyBrake, false);
});

test('subscribers see state from two source types, in one session', async () => {
  const { engine, inputs } = setup();
  const snapshots = [];
  const off = engine.subscribe(s => snapshots.push(s));
  await inputs.submit({ source: 'keyboard', key: 't' });
  engine.step(1);
  assert.equal(snapshots.at(-1), engine.getState());
  assert.equal(engine.getState().display.speed, engine.getState().speed);
  off();
});

test('session pause and mismatch reject changes', async () => {
  const { engine, inputs } = setup();
  assert.equal(engine.pauseSession().accepted, true);
  assert.equal((await inputs.submit({ source: '2d', type: 'MASTER_HANDLE_SET', value: 'TRACTION' })).accepted, false);
  assert.equal((await inputs.submit({ source: '3d', sessionId: 'wrong-session', type: 'MASTER_HANDLE_SET', value: 'TRACTION' })).accepted, false);
});
