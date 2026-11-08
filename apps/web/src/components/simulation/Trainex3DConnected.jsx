import {audioService} from '../../services/audioService.js';
import {useSyncExternalStore} from 'react';
import {Simulator3D} from '@trainex/simulator-3d';
import {
 subscribeTrainex,getTrainexSnapshot,sendTrainexInput,
 startTrainexSession,pauseTrainexSession,resumeTrainexSession,
 resetTrainexSession,endTrainexSession,
} from '../../integrations/trainexClient.js';

// Both 2D and 3D use the same shared website session and Simulation Engine.
const sessionActions=Object.freeze({
 start:(...args)=>{void audioService.enable().catch(()=>{});return startTrainexSession(...args);},
 pause:pauseTrainexSession,
 resume:(...args)=>{void audioService.enable().catch(()=>{});return resumeTrainexSession(...args);},
 reset:resetTrainexSession,
 end:endTrainexSession,
});
export default function Trainex3DConnected(){
 const snap=useSyncExternalStore(subscribeTrainex,getTrainexSnapshot,getTrainexSnapshot);
 return <Simulator3D trainState={snap.trainState} ready={snap.ready} sessionId={snap.sessionId}
   sessionStatus={snap.sessionStatus} sendInput={sendTrainexInput} sessionActions={sessionActions}/>;
}
