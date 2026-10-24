import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import CabinViewport from './CabinViewport.jsx';
import CabSessionHUD from './CabSessionHUD.jsx';
import MobileCabControls from './MobileCabControls.jsx';
import TrainReadings from './TrainReadings.jsx';
import {createControlInteractionHandler} from '../interactions/ControlInteractionHandler.js';

/** Same in-frame session HUD and live readings layout as the 2D simulator.
 * No component/guide information notifications are rendered in the 3D view.
 */
export default function Simulator3D({
 trainState=null,sendInput,ready=false,sessionId,sessionStatus='IDLE',modelUrl,
 sessionActions=null,onStartSession,onPauseSession,onResumeSession,onStopSession,onResetSession,
}){
 const stageRef=useRef(null),cameraApi=useRef(null);
 const props=useRef({trainState,sendInput,ready,sessionId});props.current={trainState,sendInput,ready,sessionId};
 const [cameraResetToken,setCameraResetToken]=useState(0);
 const [busy,setBusy]=useState(false);
 const [expanded,setExpanded]=useState(false);
 const [fallbackFullscreen,setFallbackFullscreen]=useState(false);
 const [lastError,setLastError]=useState('');
 const handler=useMemo(()=>createControlInteractionHandler({
  getState:()=>props.current.trainState,
  getSessionId:()=>props.current.ready?props.current.sessionId:null,
  sendInput:event=>props.current.sendInput?.(event),
  onFeedback:message=>{if(message&&!/Command accepted\./i.test(message))setLastError(message);},
 }),[]);
 const picked=useCallback(object=>{void handler.activate(object)},[handler]);
 const detent=useCallback(pos=>handler.submit('MASTER_HANDLE_SET',pos),[handler]);
 const sessions={
  start:sessionActions?.start??onStartSession,
  pause:sessionActions?.pause??onPauseSession,
  resume:sessionActions?.resume??onResumeSession,
  reset:sessionActions?.reset??onResetSession,
  end:sessionActions?.end??onStopSession,
 };
 const sessionsRef=useRef(sessions);sessionsRef.current=sessions;
 const doSession=useCallback(async action=>{
  const fn=sessionsRef.current[action];
  if(typeof fn!=='function') {setLastError('Session controller unavailable.');return;}
  setBusy(true);setLastError('');
  try{
   const result=await fn();
   if(result?.accepted===false)setLastError(result.reason??'Session action rejected.');
   if(action==='reset')setCameraResetToken(v=>v+1);
  }catch(error){setLastError(error?.message??'Session action failed.');}
  finally{setBusy(false);}
 },[]);
 useEffect(()=>{
  const onChange=()=>{setExpanded(document.fullscreenElement===stageRef.current);if(!document.fullscreenElement)setFallbackFullscreen(false);};
  document.addEventListener('fullscreenchange',onChange);
  return()=>document.removeEventListener('fullscreenchange',onChange);
 },[]);
 useEffect(()=>{
  if(!fallbackFullscreen)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  const onEsc=e=>{if(e.key==='Escape'){setFallbackFullscreen(false);setExpanded(false);}};
  window.addEventListener('keydown',onEsc);
  return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onEsc);};
 },[fallbackFullscreen]);
 const expand=useCallback(async()=>{
  const element=stageRef.current;if(!element)return;
  if(fallbackFullscreen){setFallbackFullscreen(false);setExpanded(false);return;}
  if(document.fullscreenElement){await document.exitFullscreen();return;}
  try{
   if(element.requestFullscreen){await element.requestFullscreen();setExpanded(true);return;}
  }catch{/* iOS Safari does not always provide element fullscreen */}
  setFallbackFullscreen(true);setExpanded(true);
 },[fallbackFullscreen]);
 const onMove=useCallback((direction,active)=>cameraApi.current?.setMoveDirection(direction,active),[]);
 const onStep=useCallback(direction=>cameraApi.current?.step(direction),[]);
 const resetCamera=useCallback(()=>setCameraResetToken(v=>v+1),[]);
 return <section className="trainex-3d" aria-label="TRAINEX 3D driver cabin simulator">
   <div className="t3d-heading">
     <span className="t3d-eyebrow">TRAIN DRIVER CAB · 3D SIMULATOR</span>
     <h2>Driver's Control Desk</h2>
     <p>Operate the physical controls in the 3D cabin. Train state is shared with the 2D simulator.</p>
   </div>
   <TrainReadings trainState={trainState}/>
   <div className={`t3d-game ${fallbackFullscreen?'t3d-fallback-fullscreen':''}`} ref={stageRef} data-expanded={expanded}>
     <CabSessionHUD status={sessionStatus} busy={busy} onAction={doSession} expanded={expanded} onExpand={expand}/>
     <div className="t3d-stage">
       <CabinViewport modelUrl={modelUrl} state={trainState} onPicked={picked} onMasterDetent={detent}
         cameraResetToken={cameraResetToken} onCameraApi={api=>{cameraApi.current=api;}}/>
       <MobileCabControls onMove={onMove} onStep={onStep} onReset={resetCamera}/>
     </div>
     <div className="t3d-game-footer">Drag to look · Tap cab controls · Scroll/pinch to move · WASD on desktop</div>
   </div>
   <span className="t3d-sr-only" role="status" aria-live="polite">{lastError}</span>
 </section>;
}
