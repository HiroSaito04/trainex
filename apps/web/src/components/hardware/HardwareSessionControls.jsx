import {useState,useSyncExternalStore} from 'react';
import {subscribeTrainex,getTrainexSnapshot,startTrainexSession,pauseTrainexSession,resumeTrainexSession,resetTrainexSession,endTrainexSession} from '../../integrations/trainexClient.js';
import {disconnectHardware} from '../../integrations/hardwareAdapter.js';
export default function HardwareSessionControls(){
 const {sessionStatus,sessionId,trainState}=useSyncExternalStore(subscribeTrainex,getTrainexSnapshot,getTrainexSnapshot);
 const [message,setMessage]=useState('');
 function run(fn,ends=false){const result=fn();if(ends&&result?.accepted)disconnectHardware();setMessage(result?.accepted?'Session updated.':result?.reason??'Command failed.');}
 return <section className="panel card-stack" aria-label="Hardware simulation session">
  <div className="section-heading"><p className="eyebrow">SHARED SIMULATION SESSION</p><h2>Session Controls</h2></div>
  <p><strong>{sessionStatus}</strong> · {sessionId??'No active session'}</p>
  <p>Start a session here before pairing your ESP32. The 2D and 3D simulators share this same train state.</p>
  <div className="action-row">
   <button type="button" className="btn btn-primary" disabled={sessionStatus==='RUNNING'||sessionStatus==='PAUSED'} onClick={()=>run(startTrainexSession)}>Start</button>
   <button type="button" className="btn btn-secondary" disabled={sessionStatus!=='PAUSED'} onClick={()=>run(resumeTrainexSession)}>Resume</button>
   <button type="button" className="btn btn-secondary" disabled={sessionStatus!=='RUNNING'} onClick={()=>run(pauseTrainexSession)}>Pause</button>
   <button type="button" className="btn btn-secondary" disabled={!['RUNNING','PAUSED'].includes(sessionStatus)} onClick={()=>run(resetTrainexSession)}>Reset Session</button>
   <button type="button" className="btn btn-secondary" disabled={!['RUNNING','PAUSED'].includes(sessionStatus)} onClick={()=>run(endTrainexSession,true)}>End</button>
  </div>
  <p className="tiny-note">Speed: {Number.isFinite(trainState?.speed)?trainState.speed.toFixed(1):'—'} km/h · Master: {trainState?.masterHandle??'—'} · Doors: {trainState?.doorState??'—'}</p>
  {message&&<p role="status" className="tiny-note">{message}</p>}
 </section>;
}
