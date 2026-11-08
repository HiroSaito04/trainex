import HudIcon from '../ui/HudIcons.jsx';
import {getHudState} from '../ui/sessionState.js';

function Action({icon,label,variant,disabled,onClick}){
 return <button type="button" className={`t3d-hud-action t3d-${variant}`} disabled={disabled}
   aria-label={label} title={label} onClick={onClick}>
   <HudIcon name={icon}/><span>{label}</span>
 </button>;
}
export default function CabSessionHUD({status,busy,onAction,expanded,onExpand}){
 const s=getHudState(status);
 return <div className="t3d-game-hud" role="toolbar" aria-label="3D simulator session controls">
   <div className={`t3d-session-indicator ${s.running?'is-live':s.paused?'is-paused':''}`} role="status">
     <span className="t3d-session-led" aria-hidden="true"/>
     <span className="t3d-session-caption">SESSION</span>
     <strong>{s.label}</strong>
   </div>
   <div className="t3d-session-actions">
     <Action icon="play" label={s.startLabel} variant="start" disabled={busy||!s.canStart} onClick={()=>onAction(s.startAction)}/>
     <Action icon="pause" label="Pause" variant="pause" disabled={busy||!s.canPause} onClick={()=>onAction('pause')}/>
     <Action icon="reset" label="Reset" variant="reset" disabled={busy} onClick={()=>onAction('reset')}/>
     <Action icon="end" label="End" variant="end" disabled={busy||!s.canEnd} onClick={()=>onAction('end')}/>
   </div>
   <button type="button" className="t3d-hud-action t3d-expand" onClick={onExpand} aria-label={expanded?'Exit fullscreen':'Expand simulator'}>
     <HudIcon name={expanded?'collapse':'expand'}/><span>{expanded?'Exit':'Expand'}</span>
   </button>
 </div>;
}
