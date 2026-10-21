import test from 'node:test';
import assert from 'node:assert/strict';

import { validateCommand } from '../../packages/contracts/src/index.js';
import { createInputManager } from '../../packages/input-manager/src/index.js';
import { createEngine } from '../../packages/simulation-engine/src/index.js';
import { getConsoleState } from '../../packages/simulator-2d/src/config/consoleLayout.js';
import { initializeTrainexRuntime } from '../../apps/web/src/integrations/trainexRuntime.js';
import {
  sendTrainexInput, getTrainexSnapshot, subscribeTrainex,
} from '../../apps/web/src/integrations/trainexClient.js';
import { forwardHardwareInput } from '../../apps/web/src/integrations/inputAdapter.js';
import { sessionCoordinator } from '../../apps/web/src/services/sessionCoordinator.js';

// This test deliberately doesn't require React, JSX transforms or a browser.
test('shared contracts allow pointer source and preserve provenance', async () => {
  const engine = createEngine();
  const { sessionId } = engine.startSession();
  const manager = createInputManager({
    getSessionId: () => sessionId,
    dispatchCommand: command => {
      assert.equal(command.source, 'pointer');
      return engine.sendCommand(command);
    },
  });
  const result = await manager.submit({ source: 'pointer', controlId: 'DOORS_OPEN', sessionId });
  assert.equal(result.accepted, true);
  assert.equal(engine.getState().doorState, 'OPENING');
  assert.equal(validateCommand({ type: 'DOOR_CLOSE_REQUEST', value: null, source: 'pointer', sessionId }).valid, true);
  engine.destroy();
});

test('website shares one engine with input manager, state notifications and 2D indications', async () => {
  const installation = initializeTrainexRuntime();
  const notifications = [];
  const unsubscribe = subscribeTrainex(() => notifications.push(getTrainexSnapshot().sessionStatus));
  try {
    assert.equal(getTrainexSnapshot().sessionStatus, 'IDLE');
    const session = sessionCoordinator.start();
    assert.equal(session.accepted, true);
    assert.equal(getTrainexSnapshot().sessionStatus, 'RUNNING');
    assert.equal(getTrainexSnapshot().sessionId, session.sessionId);

    const accepted = await sendTrainexInput({
      source: '2d', type: 'MASTER_HANDLE_SET', value: 'TRACTION', sessionId: session.sessionId,
    });
    assert.equal(accepted.accepted, true);
    installation.engine.step(2);
    assert.ok(getConsoleState(getTrainexSnapshot().trainState).speed > 0);
    assert.equal(getConsoleState(getTrainexSnapshot().trainState).masterHandle, 'TRACTION');

    assert.equal(sessionCoordinator.pause().accepted, true);
    assert.equal(getTrainexSnapshot().ready, false);
    assert.equal(getTrainexSnapshot().sessionStatus, 'PAUSED');
    assert.equal(sessionCoordinator.resume().accepted, true);
    assert.equal(getTrainexSnapshot().ready, true);
    assert.ok(notifications.includes('PAUSED'));
    assert.ok(notifications.includes('RUNNING'));
    assert.equal(sessionCoordinator.end().accepted, true);
  } finally {
    unsubscribe();
    installation.dispose();
  }
});

test('hardware relay message is normalized to canonical input command', async () => {
  const installation = initializeTrainexRuntime();
  try {
    const { sessionId } = sessionCoordinator.start();
    const result = await forwardHardwareInput({
      sessionId,
      deviceId: 'esp32-1',
      sequence: 1,
      control: 'DOORS_OPEN',
    });
    assert.equal(result.accepted, true);
    assert.equal(getTrainexSnapshot().trainState.doorState, 'OPENING');
    const replay = await forwardHardwareInput({
      sessionId,
      deviceId: 'esp32-1',
      sequence: 1,
      controlId: 'DOORS_OPEN',
    });
    assert.equal(replay.accepted, false);
  } finally {
    installation.dispose();
  }
});
