import HudIcon from '../ui/HudIcons.jsx';

/** The buttons move the DRIVER CAMERA only; they never send train commands. */
function HoldMove({direction,label,onMove,onStep}){
 const begin=e=>{
  if(e.button!==0 && e.pointerType!=='touch')return;
  e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);
  onMove(direction,true);
 };
 const stop=e=>{onMove(direction,false);if(e?.pointerId!=null&&e.currentTarget.hasPointerCapture?.(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
 return <button type="button" className={`t3d-pad-btn t3d-pad-${direction}`} aria-label={label} title={label}
   onPointerDown={begin} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={()=>onMove(direction,false)}
   onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();onMove(direction,true);}}}
   onKeyUp={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();onMove(direction,false);}}}
   onBlur={()=>onMove(direction,false)}
   onClick={e=>{if(e.detail===0)onStep(direction);}}>
    <HudIcon name={direction==='forward'?'up':direction==='backward'?'down':direction==='left'?'left':'right'}/>
 </button>;
}

export default function MobileCabControls({onMove,onStep,onReset}){
 return <div className="t3d-touch-controls" aria-label="Mobile cab navigation controls">
   <div className="t3d-touch-pad" role="group" aria-label="Move driver viewpoint inside the cabin">
     <HoldMove direction="forward" label="Move forward" onMove={onMove} onStep={onStep}/>
     <HoldMove direction="left" label="Step left" onMove={onMove} onStep={onStep}/>
     <span className="t3d-pad-center" aria-hidden="true"/>
     <HoldMove direction="right" label="Step right" onMove={onMove} onStep={onStep}/>
     <HoldMove direction="backward" label="Move backward" onMove={onMove} onStep={onStep}/>
   </div>
   <button type="button" className="t3d-view-reset" aria-label="Reset driver camera" title="Reset driver view" onClick={onReset}>
     <HudIcon name="reset"/><span>View</span>
   </button>
 </div>;
}
