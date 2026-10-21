import { useSyncExternalStore, useState } from 'react';
import { Simulator2D } from '@trainex/simulator-2d';
import {
  subscribeTrainex, getTrainexSnapshot, sendTrainexInput,
  startTrainexSession, pauseTrainexSession, resumeTrainexSession,
  resetTrainexSession, endTrainexSession,
} from '../../integrations/trainexClient.js';

function SessionControls({ status }) {
  const [message, setMessage] = useState('');
  const execute = operation => {
    const result = operation();
    setMessage(result.accepted === false ? result.reason : '');
  };
  return (
    <div className="action-row" aria-label="Simulation session controls">
      <button className="btn btn-primary" type="button"
        disabled={!['IDLE', 'ENDED'].includes(status)}
        onClick={() => execute(startTrainexSession)}>Start</button>
      <button className="btn btn-secondary" type="button"
        disabled={status !== 'RUNNING'}
        onClick={() => execute(pauseTrainexSession)}>Pause</button>
      <button className="btn btn-secondary" type="button"
        disabled={status !== 'PAUSED'}
        onClick={() => execute(resumeTrainexSession)}>Resume</button>
      <button className="btn btn-ghost" type="button"
        disabled={!['RUNNING', 'PAUSED'].includes(status)}
        onClick={() => execute(resetTrainexSession)}>Reset</button>
      <button className="btn btn-ghost" type="button"
        disabled={!['RUNNING', 'PAUSED'].includes(status)}
        onClick={() => execute(endTrainexSession)}>End</button>
      <span role="status" aria-live="polite">{message || `Session: ${status}`}</span>
    </div>
  );
}

export default function Trainex2DConnected({ showSessionControls = true }) {
  const snapshot = useSyncExternalStore(
    subscribeTrainex, getTrainexSnapshot, getTrainexSnapshot
  );
  return (
    <div className="trainex-2d-connected">
      {showSessionControls && <SessionControls status={snapshot.sessionStatus} />}
      <Simulator2D
        trainState={snapshot.trainState}
        ready={snapshot.ready}
        sessionId={snapshot.sessionId ?? undefined}
        sendInput={sendTrainexInput}
      />
    </div>
  );
}
