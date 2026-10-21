import {useCallback,useMemo,useRef,useState} from 'react';
import CabinViewport from './CabinViewport.jsx';
import {createControlInteractionHandler} from '../interactions/ControlInteractionHandler.js';
import {COMPONENT_LABELS} from '../config/objectMappings.js';
export default function Simulator3D({trainState=null,sendInput,ready=false,sessionId,sessionStatus,modelUrl,onStartSession,onResumeSession,onStopSession,onResetSession}){
 const [selected,setSelected]=useState(null),[feedback,setFeedback]=useState(''),[matched,setMatched]=useState(null),[cameraResetToken,setCameraResetToken]=useState(0),[busy,setBusy]=useState(false);
 const stageRef=useRef(null), props=useRef({trainState,sendInput,ready,sessionId});props.current={trainState,sendInput,ready,sessionId};
 const handler=useMemo(()=>createControlInteractionHandler({getState:()=>props.current.trainState,
  getSessionId:()=>props.current.ready?props.current.sessionId:null,
  sendInput:event=>props.current.sendInput?.(event),onInspect:setSelected,onFeedback:setFeedback}),[]);
 const handlePick=useCallback(object=>{void handler.activate(object)},[handler]);
 const onMasterDetent=useCallback(pos=>handler.submit('MASTER_HANDLE_SET',pos),[handler]);
 async function sessionAction(fn){if(typeof fn!=='function')return;setBusy(true);setFeedback('');try{const result=await fn();if(result?.accepted===false)setFeedback(result.reason??'Session command rejected.')}catch(e){setFeedback(e.message??'Session command failed.')}finally{setBusy(false)}}
 async function toggleFullscreen(){const el=stageRef.current;if(!el)return;try{if(document.fullscreenElement)await document.exitFullscreen();else if(el.requestFullscreen)await el.requestFullscreen();else setFeedback('Fullscreen is not supported in this browser.')}catch(e){setFeedback(e.message)}}
 async function reset(){setCameraResetToken(n=>n+1);await sessionAction(onResetSession)}
 const running=sessionStatus==='RUNNING',paused=sessionStatus==='PAUSED';
 return <section className="trainex-3d" aria-label="TRAINEX 3D Driver Cabin">
  <div className="t3d-heading"><div><span className="t3d-eyebrow">TRAINEX · ORIGINAL DRIVER CAB</span><h2>3D Driver Cabin</h2><p>Master handle, emergency brake and passenger-door actions use the existing 3D desk.</p></div><span className={`t3d-engine-status ${running?'is-running':''}`}>{sessionStatus??'IDLE'}</span></div>
  <div className="t3d-external-controls" role="toolbar" aria-label="Simulation session controls">
   <button type="button" disabled={busy||running} onClick={()=>sessionAction(paused?onResumeSession:onStartSession)}>{paused?'Resume':'Start'}</button>
   <button type="button" disabled={busy||(!running&&!paused)} onClick={()=>sessionAction(onStopSession)}>Stop</button>
   <button type="button" disabled={busy} onClick={reset}>Reset</button>
   <button type="button" onClick={toggleFullscreen}>Expand Full Screen</button>
  </div>
  <div className="t3d-stage" ref={stageRef}>
   <CabinViewport modelUrl={modelUrl} state={trainState} onPicked={handlePick} onMasterDetent={onMasterDetent} onReady={setMatched} cameraResetToken={cameraResetToken}/>
  </div>
  <div className="t3d-footer"><p role="status" aria-live="polite">{feedback||(selected?`Selected: ${COMPONENT_LABELS[selected]??selected}`:'Click a 3D control inside the cab.')}</p><small>Physical controls: master EB/B3/B2/B1/N/P1/P2/P3, emergency brake, door open/close. EB reset needs a designated original mesh. Only session controls appear outside the simulator.</small></div>
 </section>;
}
