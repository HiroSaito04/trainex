import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeTrainexRuntime } from '../../integration-examples/apps/web/src/integrations/trainexRuntime.js';
import {
  getTrainexSnapshot, subscribeTrainex, sendTrainexInput,
  startTrainexSession, pauseTrainexSession, resumeTrainexSession,
} from '../../integration-examples/apps/web/src/integrations/trainexClient.js';

test('website bridge has one stable snapshot and publishes engine state changes', async () => {
  const app = initializeTrainexRuntime();
  try {
    assert.equal(getTrainexSnapshot(), getTrainexSnapshot());
    let seen = 0;
    const unsubscribe = subscribeTrainex(() => seen++);
    const started = startTrainexSession();
    assert.equal(started.accepted, true);
    assert.equal(getTrainexSnapshot().sessionStatus, 'RUNNING');
    assert.equal(getTrainexSnapshot().sessionId, started.sessionId);
    assert.equal((await sendTrainexInput({ source: '2d', type: 'MASTER_HANDLE_SET', value: 'TRACTION', sessionId: started.sessionId })).accepted, true);
    app.engine.step(1);
    assert.ok(getTrainexSnapshot().trainState.speed > 0);
    assert.ok(seen >= 2);
    assert.equal(pauseTrainexSession().accepted, true);
    assert.equal(getTrainexSnapshot().ready, false);
    assert.equal(resumeTrainexSession().accepted, true);
    assert.equal(getTrainexSnapshot().ready, true);
    unsubscribe();
  } finally {
    app.dispose();
  }
});
