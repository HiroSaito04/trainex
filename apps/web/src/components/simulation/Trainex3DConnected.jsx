import {useSyncExternalStore} from 'react';
import {Simulator3D} from '@trainex/simulator-3d';
import {subscribeTrainex,getTrainexSnapshot,sendTrainexInput,startTrainexSession,resumeTrainexSession,resetTrainexSession,endTrainexSession} from '../../integrations/trainexClient.js';
export default function Trainex3DConnected(){
 const snap=useSyncExternalStore(subscribeTrainex,getTrainexSnapshot,getTrainexSnapshot);
 return <Simulator3D trainState={snap.trainState} ready={snap.ready} sessionId={snap.sessionId??undefined}
  sessionStatus={snap.sessionStatus} sendInput={sendTrainexInput} onStartSession={startTrainexSession}
  onResumeSession={resumeTrainexSession} onStopSession={endTrainexSession} onResetSession={resetTrainexSession}/>;
}
