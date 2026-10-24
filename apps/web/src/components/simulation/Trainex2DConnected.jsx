import './Trainex2DConnected.css';
import {useSyncExternalStore} from 'react';
import {Simulator2D} from '@trainex/simulator-2d';
import {
  subscribeTrainex,getTrainexSnapshot,sendTrainexInput,
  startTrainexSession,pauseTrainexSession,resumeTrainexSession,
  resetTrainexSession,endTrainexSession,
} from '../../integrations/trainexClient.js';

/** Web adapter: all actions use the existing shared TRAINEX runtime. */
const sessionActions=Object.freeze({
  start:startTrainexSession,
  pause:pauseTrainexSession,
  resume:resumeTrainexSession,
  reset:resetTrainexSession,
  end:endTrainexSession,
});
export default function Trainex2DConnected({svgUrl}){
  const snapshot=useSyncExternalStore(subscribeTrainex,getTrainexSnapshot,getTrainexSnapshot);
  return <div className="t2d-connected">
    <Simulator2D trainState={snapshot.trainState} ready={snapshot.ready}
      sessionId={snapshot.sessionId} sessionStatus={snapshot.sessionStatus}
      sessionActions={sessionActions}
      svgUrl={svgUrl} sendInput={sendTrainexInput}/>
  </div>;
}
