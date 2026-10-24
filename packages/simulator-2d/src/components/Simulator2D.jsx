import {useCallback,useState} from 'react';
import CabViewer from './CabViewer.jsx';
import {PART_BY_ID} from '../config/consoleParts.js';
import {getCabDisplayState,displayNumber} from '../core/trainDisplayState.js';
import {useCabControls} from '../hooks/useCabControls.js';

const data=(title,value,unit=null,variant='')=><div className={`t2d-value ${variant}`} key={title}>
  <span>{title}</span><strong>{value}{unit&&<small> {unit}</small>}</strong>
 </div>;

/**
 * The full simulator owns no train physics or session state. The website passes
 * the one engine snapshot and the existing Centralized Input Manager dispatcher.
 */
export default function Simulator2D({trainState=null,sendInput,ready=false,sessionId=null,svgUrl,sessionStatus='IDLE',sessionActions=null}){
 const state=getCabDisplayState(trainState);
 const controls=useCabControls({sendInput,sessionId,ready});
 const [selection,setSelection]=useState(null);
 const onDismiss=useCallback(()=>setSelection(null),[]);
 const onInspect=useCallback((id,note='')=>{
   const part=PART_BY_ID[id];if(!part)return;
   setSelection({...part,note});
 },[]);
 return <section className="trainex-simulator-2d" aria-label="Interactive TRAINEX 2D driver cab">
   <div className="t2d-heading">
     <div><span className="t2d-eyebrow">TRAIN DRIVER CAB · 2D SIMULATOR</span>
       <h2>Driver's Control Desk</h2>
       <p>Operate the supported controls in your own cab artwork. Tap any component for its purpose.</p>
     </div>
     <span className={`t2d-status ${ready?'is-running':''}`}>{ready?'CONNECTED':'SESSION INACTIVE'}</span>
   </div>
   <div className="t2d-instruments" aria-label="Authoritative live simulation readings">
     {data('SPEED',displayNumber(state.speed,1),'km/h')}
     {data('MASTER HANDLE',state.masterHandle??'—')}
     {data('BRAKE CYLINDER',displayNumber(state.brakeCylinderPressureKpa),'kPa')}
     {data('BRAKE PIPE',displayNumber(state.brakePipePressureKpa),'kPa')}
     {data('DOORS',state.doorState??'—',null,state.allDoorsClosed===true?'t2d-good':'')}
     {data('EMERGENCY BRAKE',state.emergencyBrake===null?'—':state.emergencyBrake?'ACTIVE':'CLEAR',null,state.emergencyBrake===true?'t2d-alert':'t2d-good')}
   </div>
   <CabViewer state={state} ready={ready} controls={controls} svgUrl={svgUrl}
      sessionStatus={sessionStatus} sessionActions={sessionActions}
      selection={selection} onInspect={onInspect} onDismiss={onDismiss}/>
   <p className="t2d-disclaimer">Cab indications follow available train-state data. Unavailable readings are shown as —.</p>
 </section>;
}
