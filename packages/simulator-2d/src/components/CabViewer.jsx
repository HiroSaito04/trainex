import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import bundledCabSvg from '../assets/TRAINEX-Driver-Cab-2D.svg?url';
import CabLiveOverlay from './CabLiveOverlay.jsx';
import {CAB_PARTS,DISPLAY_DETENTS} from '../config/consoleParts.js';
import {getSvgPoint,masterDetentFromY} from '../core/cabGeometry.js';
import {contextualDriverGuide,driverControlWarning,guideFromRejection} from '../core/driverGuide.js';
import {useCabViewport} from '../hooks/useCabViewport.js';

export const DEFAULT_CAB_SVG_URL='/models/2d/trainex-driver-cab.svg';

function HitGeometry({shape,...rest}){
  if(shape.kind==='circle')return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...rest}/>;
  if(shape.kind==='rect')return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx??0} {...rest}/>;
  if(shape.kind==='polygon')return <polygon points={shape.points.map(p=>p.join(',')).join(' ')} {...rest}/>;
  return null;
}

/** The existing component-info notification: no panel below the artwork. */
function CabPartNotice({selection,onDismiss}){
  useEffect(()=>{
    if(!selection)return undefined;
    const timeout=setTimeout(onDismiss,8500);
    return ()=>clearTimeout(timeout);
  },[selection,onDismiss]);
  if(!selection)return null;
  return <aside className="t2d-part-notice" role="status" aria-live="polite" aria-atomic="true">
    <div className="t2d-part-copy">
      <small>{selection.group} · CAB COMPONENT</small>
      <h3>{selection.label}</h3>
      <p>{selection.description}</p>
      {selection.note&&<p className="t2d-part-note">{selection.note}</p>}
    </div>
    <button type="button" className="t2d-notice-dismiss" aria-label="Close component information" onClick={onDismiss}>×</button>
  </aside>;
}

/** Context-sensitive driving hints, warnings and rejected-command explanations. */
function CabGuideNotice({guide,onDismiss}){
  if(!guide)return null;
  return <aside className={`t2d-part-notice t2d-guide-notice ${guide.tone==='warning'?'is-warning':''}`}
    role={guide.tone==='warning'?'alert':'status'} aria-live={guide.tone==='warning'?'assertive':'polite'}>
    <div className="t2d-part-copy">
      <small>{guide.tone==='warning'?'⚠ OPERATING WARNING':'✦ DRIVER GUIDE'}</small>
      <h3>{guide.title}</h3>
      <p>{guide.description}</p>
    </div>
    <button type="button" className="t2d-notice-dismiss" aria-label="Dismiss driving guide" onClick={onDismiss}>×</button>
  </aside>;
}

/** Small SVG icons avoid third-party dependencies and scale cleanly on mobile. */
function HUDIcon({name}){
  const common={width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true};
  switch(name){
    case 'play':return <svg {...common}><path d="M8 5 19 12 8 19Z" fill="currentColor" stroke="none"/></svg>;
    case 'pause':return <svg {...common}><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></svg>;
    case 'restart':return <svg {...common}><path d="M3 11a9 9 0 1 1 2.8 6.5"/><path d="M3 4v7h7"/></svg>;
    case 'stop':return <svg {...common}><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/></svg>;
    case 'expand':return <svg {...common}><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/></svg>;
    case 'collapse':return <svg {...common}><path d="M3 9h6V3M21 9h-6V3M3 15h6v6M21 15h-6v6"/></svg>;
    default:return null;
  }
}

function GameHUDButton({icon,label,variant='',disabled=false,onClick,title}){
  return <button type="button" className={`t2d-hud-button ${variant}`} disabled={disabled}
    onClick={onClick} title={title??label} aria-label={label}>
    <HUDIcon name={icon}/>
    <span>{label}</span>
  </button>;
}

function CabSessionHUD({status='IDLE',busy=false,onAction}){
  const running=status==='RUNNING',paused=status==='PAUSED';
  return <div className="t2d-session-hud" role="group" aria-label="2D train simulation session">
    <div className={`t2d-session-indicator ${running?'is-live':paused?'is-paused':''}`} aria-live="polite">
      <span className="t2d-session-led" aria-hidden="true"/>
      <span className="t2d-session-caption">SESSION</span>
      <strong>{status??'IDLE'}</strong>
    </div>
    <div className="t2d-session-actions">
      <GameHUDButton icon="play" label={paused?'Resume':'Start'} variant="t2d-session-start"
        disabled={busy||running} onClick={()=>onAction(paused?'resume':'start')}/>
      <GameHUDButton icon="pause" label="Pause" variant="t2d-session-pause"
        disabled={busy||!running} onClick={()=>onAction('pause')}/>
      <GameHUDButton icon="restart" label="Reset" variant="t2d-session-reset"
        disabled={busy||(!running&&!paused)} onClick={()=>onAction('reset')}/>
      <GameHUDButton icon="stop" label="End" variant="t2d-session-end"
        disabled={busy||(!running&&!paused)} onClick={()=>onAction('end')}/>
    </div>
  </div>;
}

export default function CabViewer({state,ready,controls,selection,onInspect,onDismiss,
  svgUrl=DEFAULT_CAB_SVG_URL,sessionStatus='IDLE',sessionActions=null}){
  const viewport=useCabViewport();
  const svgRef=useRef(null);
  const dragRef=useRef(null);
  const suppressClickRef=useRef(false);
  const pressTimeoutRef=useRef(null);
  const [loadError,setLoadError]=useState(false);
  const [previewDetent,setPreviewDetent]=useState(null);
  const [pressed,setPressed]=useState(null);
  const [keyboardFocus,setKeyboardFocus]=useState(null);
  const [sessionBusy,setSessionBusy]=useState(false);
  const [guideOverride,setGuideOverride]=useState(null);
  const [dismissedContextKey,setDismissedContextKey]=useState(null);
  const contextGuide=useMemo(()=>contextualDriverGuide({state,sessionStatus,ready}),
    [state.speed,state.masterHandle,state.emergencyBrake,state.doorState,state.allDoorsClosed,sessionStatus,ready]);
  const guide=guideOverride || (contextGuide.key===dismissedContextKey?null:contextGuide);
  const url=loadError?bundledCabSvg:svgUrl;

  useEffect(()=>()=>{if(pressTimeoutRef.current)clearTimeout(pressTimeoutRef.current);},[]);
  useEffect(()=>setPreviewDetent(null),[state.masterHandle]);
  useEffect(()=>setLoadError(false),[svgUrl]);
  useEffect(()=>{
    if(!guideOverride)return undefined;
    const timeout=setTimeout(()=>setGuideOverride(null),8500);
    return ()=>clearTimeout(timeout);
  },[guideOverride]);

  const showGuide=useCallback(next=>{
    if(next)setGuideOverride({...next,instance:Date.now()});
  },[]);
  const dismissGuide=useCallback(()=>{
    if(guideOverride)setGuideOverride(null);
    else setDismissedContextKey(contextGuide.key);
  },[guideOverride,contextGuide.key]);
  const pulse=useCallback(id=>{
    setPressed(id);
    if(pressTimeoutRef.current)clearTimeout(pressTimeoutRef.current);
    pressTimeoutRef.current=setTimeout(()=>setPressed(null),200);
  },[]);

  const sendWithGuide=useCallback(async(type,value=null)=>{
    const preflight=driverControlWarning(type,{state,ready,value});
    if(preflight){showGuide(preflight);return {accepted:false,reason:preflight.description};}
    let result;
    if(type==='MASTER_HANDLE_SET')result=await controls.setMasterHandle(value);
    else if(type==='DOOR_OPEN_REQUEST')result=await controls.openDoors();
    else if(type==='DOOR_CLOSE_REQUEST')result=await controls.closeDoors();
    else if(type==='EMERGENCY_BRAKE_ACTIVATE')result=await controls.activateEmergency();
    else if(type==='EMERGENCY_BRAKE_RESET')result=await controls.resetEmergency();
    const rejected=guideFromRejection(result);
    if(rejected)showGuide(rejected);
    return result;
  },[state,ready,controls,showGuide]);

  const commitDetent=useCallback(position=>{
    setPreviewDetent(null);pulse('masterHandle');
    onInspect('masterHandle',`Selected controller position ${position}.`);
    void sendWithGuide('MASTER_HANDLE_SET',position);
  },[onInspect,pulse,sendWithGuide]);

  const clickPart=useCallback(part=>{
    pulse(part.id);
    if(part.id==='masterHandle'){
      onInspect(part.id,'Drag the handle vertically or tap one of the eight printed detents.');
      return;
    }
    onInspect(part.id);
    if(part.command)void sendWithGuide(part.command);
  },[onInspect,pulse,sendWithGuide]);

  const executeSession=useCallback(async action=>{
    if(typeof sessionActions?.[action]!=='function'){
      showGuide({key:'session-unavailable',tone:'warning',title:'Session action unavailable',
        description:'This cab is not connected to the website session controller.'});
      return;
    }
    setSessionBusy(true);
    try{
      const result=await sessionActions[action]();
      const rejected=guideFromRejection(result);
      if(rejected)showGuide(rejected);
      else setGuideOverride(null);
    }catch(error){
      showGuide({key:'session-error',tone:'warning',title:'Session action failed',
        description:error?.message??'The session controller could not complete the operation.'});
    }finally{setSessionBusy(false);}
  },[sessionActions,showGuide]);

  function startHandle(e){
    if(e.button!==0)return;
    dragRef.current={pointer:e.pointerId,last:null};
    e.currentTarget.setPointerCapture?.(e.pointerId);
    trackHandle(e);
  }
  function trackHandle(e){
    if(dragRef.current?.pointer!==e.pointerId)return;
    const p=getSvgPoint(e.clientX,e.clientY,svgRef.current);
    if(!p)return;
    const position=masterDetentFromY(p.y);
    dragRef.current.last=position;
    setPreviewDetent(position);
  }
  function endHandle(e,commit){
    const drag=dragRef.current;
    if(!drag||drag.pointer!==e.pointerId)return;
    dragRef.current=null;
    if(e.currentTarget.hasPointerCapture?.(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
    if(commit&&drag.last){
      suppressClickRef.current=true;
      commitDetent(drag.last);
    }else setPreviewDetent(null);
  }
  function shapeEvents(part){
    return {
      onClick:e=>{
        e.stopPropagation();
        if(part.id==='masterHandle'&&suppressClickRef.current){suppressClickRef.current=false;return;}
        clickPart(part);
      },
      onKeyDown:e=>{
        if(part.id==='masterHandle'&&['ArrowUp','ArrowDown'].includes(e.key)){
          e.preventDefault();
          const i=Math.max(0,DISPLAY_DETENTS.indexOf(previewDetent??state.masterHandle));
          const next=DISPLAY_DETENTS[Math.max(0,Math.min(7,i+(e.key==='ArrowDown'?1:-1)))];
          commitDetent(next);
        }else if(e.key==='Enter'||e.key===' '){e.preventDefault();clickPart(part);}
      },
      onFocus:()=>setKeyboardFocus(part.id),
      onBlur:()=>setKeyboardFocus(null),
      ...(part.id==='masterHandle'?{
        onPointerDown:startHandle,onPointerMove:trackHandle,
        onPointerUp:e=>endHandle(e,true),onPointerCancel:e=>endHandle(e,false),
      }:{}),
    };
  }
  return <div className="t2d-cab-viewer-layout">
    <div className={`t2d-cab-viewer ${viewport.fallback?'t2d-fallback-fullscreen':''}`}
      ref={viewport.viewerRef} data-expanded={viewport.expanded}>
      <div className="t2d-game-hud" role="toolbar" aria-label="In-cab session controls">
        <CabSessionHUD status={sessionStatus} busy={sessionBusy} onAction={executeSession}/>
        <GameHUDButton icon={viewport.expanded?'collapse':'expand'}
          label={viewport.expanded?'Exit Fullscreen':'Expand'} variant="t2d-expand"
          onClick={()=>void viewport.toggleExpanded()}/>
      </div>
      <div className="t2d-cab-stage">
        <div className="t2d-scroller" ref={viewport.scrollRef}
          aria-label="Interactive train cab. Touch or click a component to inspect it.">
          <div className="t2d-scene">
            <svg className="t2d-integrated-svg" ref={svgRef} viewBox="0 0 1540 798"
              preserveAspectRatio="xMidYMid meet" role="group"
              aria-label="Interactive 2D train cab with precisely aligned SVG controls">
              <image href={url} x="0" y="0" width="1540" height="798" preserveAspectRatio="none"
                pointerEvents="none" onError={()=>setLoadError(true)}/>
              <CabLiveOverlay state={state} previewDetent={previewDetent}/>
              {CAB_PARTS.map(part=><HitGeometry key={part.id} shape={part.shape}
                className={`t2d-svg-hit ${part.command?'t2d-svg-action':''} ${pressed===part.id?'is-pressed':''} ${keyboardFocus===part.id?'is-focused':''} ${part.group==='Cab Structure'?'t2d-svg-structure':''}`}
                role="button" tabIndex="0" aria-label={part.label} data-part-id={part.id}
                pointerEvents="all" {...shapeEvents(part)}/>)}
              {DISPLAY_DETENTS.map((pos,i)=><rect key={pos} x="702" y={324+i*14.3} width="26" height="14.3"
                className="t2d-svg-hit t2d-svg-detent" role="button" tabIndex="0"
                aria-label={`Master handle ${pos}`} aria-pressed={(previewDetent??state.masterHandle)===pos}
                onClick={()=>commitDetent(pos)}
                onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();commitDetent(pos);}}}/>)}
            </svg>
          </div>
        </div>
        <div className="t2d-notification-stack" aria-label="Cab information and driving guidance">
          <CabPartNotice selection={selection} onDismiss={onDismiss}/>
          <CabGuideNotice guide={guide} onDismiss={dismissGuide}/>
        </div>
      </div>
      {state.emergencyBrake===true&&<div className="t2d-recovery">
        <button type="button" disabled={!ready} onClick={()=>{
          onInspect('emergencyBrake','Emergency brake reset requested.');
          void sendWithGuide('EMERGENCY_BRAKE_RESET');
        }}>Reset emergency brake</button>
      </div>}
      <div className="t2d-game-footer">Tap a cab component for its function. Driver guidance appears at the top-right.</div>
    </div>
    <details className="t2d-mobile-handle"><summary>Master handle · Eight positions</summary>
      <div className="t2d-detent-buttons">{DISPLAY_DETENTS.map(pos=><button key={pos} type="button"
        disabled={!ready} aria-pressed={state.masterHandle===pos} onClick={()=>commitDetent(pos)}>{pos}</button>)}</div>
    </details>
  </div>;
}
