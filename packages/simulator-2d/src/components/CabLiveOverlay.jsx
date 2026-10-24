import {useAnimatedValue} from '../hooks/useAnimatedValue.js';
import {DISPLAY_DETENTS} from '../config/consoleParts.js';

const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));

/** All drawing is in the SAME coordinate system as the user's exact SVG. */
function Needle({cx,cy,value,max,color}){
  const animated=useAnimatedValue(value,170);
  if(!Number.isFinite(animated))return null;
  const angle=(-125+clamp(animated/max,0,1)*250)*Math.PI/180;
  const dx=Math.sin(angle)*21,dy=-Math.cos(angle)*21;
  return <g className="t2d-active-dial">
    {/* Only the dial interior is obscured. Existing bezels, labels and layout stay untouched. */}
    <circle cx={cx} cy={cy} r="23" fill="#11171b" stroke="#3e494e" strokeWidth="0.7"/>
    {Array.from({length:11},(_,i)=>{
      const a=(-125+i*25)*Math.PI/180;
      return <line key={i} x1={cx+Math.sin(a)*18} y1={cy-Math.cos(a)*18}
        x2={cx+Math.sin(a)*21.5} y2={cy-Math.cos(a)*21.5} stroke="#d8e1e4" strokeWidth="1"/>;
    })}
    <line x1={cx} y1={cy} x2={cx+dx} y2={cy+dy} stroke={color} strokeWidth="3.3" strokeLinecap="round"/>
    <circle cx={cx} cy={cy} r="3" fill="#cad2d5"/>
  </g>;
}
function BrakeBar({value}){
  const animated=useAnimatedValue(value,180);
  if(!Number.isFinite(animated))return null;
  const h=64,y=206,ratio=clamp(animated/1000,0,1);
  return <g>
    <rect x="679" y={y} width="10" height={h} fill="#24272b"/>
    <rect x="679" y={y+h*(1-ratio)} width="10" height={h*ratio} fill="#f14742"/>
  </g>;
}
function MasterLever({state,previewDetent}){
  const index=DISPLAY_DETENTS.indexOf(previewDetent??state.masterHandle);
  const position=useAnimatedValue(index>=0?index:null,170);
  if(index<0)return null;
  const y=346+(Number.isFinite(position)?position:index)*11.9;
  return <g>
    {/* Only dark lever track, not panel or printed detents. */}
    <rect x="661.5" y="338" width="27" height="94" rx="3" fill="#14191d"/>
    <rect x="672" y="343" width="7" height="82" rx="2" fill="#9fa8ad"/>
    <rect x="662" y={y} width="26" height="14" rx="3.5" fill="#66727a" stroke="#101317" strokeWidth="1.5"/>
    <path d={`M665 ${y+2.4} H685`} stroke="#aab5bb" strokeWidth="1.3"/>
  </g>;
}
/**
 * The imported artwork has its original detent text baked into vector paths,
 * including a permanently-yellow N. Restore just that tiny printed text strip
 * to the surrounding painted-metal shade, then render editable live labels.
 * No highlighted plate, rectangles around the selection, or color change to
 * the control slot. All coordinates use the original cab viewBox.
 */
function ActiveDetentText({state,previewDetent}){
  const active=previewDetent??state.masterHandle??'N';
  return <g className="t2d-master-detent-labels" aria-hidden="true">
    <defs>
      <linearGradient id="t2d-master-label-metal" x1="0" y1="320" x2="0" y2="436" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#535658"/>
        <stop offset="0.5" stopColor="#4d5052"/>
        <stop offset="1" stopColor="#484b4d"/>
      </linearGradient>
    </defs>
    <rect x="701.5" y="320" width="24" height="116" fill="url(#t2d-master-label-metal)"/>
    {DISPLAY_DETENTS.map((position,i)=><text key={position}
      x="703.5" y={335+i*14.2} textAnchor="start"
      fontFamily="Arial, Helvetica, sans-serif" fontSize="10.5" fontWeight="800"
      fill={position===active?'#FFD700':'#141719'}>
      {position}
    </text>)}
  </g>;
}

function TcmsValues({state}){
  if(!Number.isFinite(state.speed) && state.emergencyBrake===null && state.allDoorsClosed===null)return null;
  const speed=Number.isFinite(state.speed)?state.speed.toFixed(1):'—';
  const doors=state.allDoorsClosed===true?'DOORS CLOSED':state.doorState??'DOORS UNKNOWN';
  return <g transform="rotate(9 1112 207)">
    {/* Narrow status readout only. No second TCMS screen or colored control squares. */}
    <rect x="1032" y="230" width="173" height="33" fill="#0d171c"/>
    <text x="1036" y="241" fontSize="8" fill="#e6f2f4" fontFamily="Arial,sans-serif" fontWeight="bold">SPEED {speed} km/h</text>
    <text x="1200" y="241" textAnchor="end" fontSize="8" fontWeight="bold" fill={state.emergencyBrake?'#ff7378':'#72dc9e'}>{state.emergencyBrake?'EB ACTIVE':'NORMAL'}</text>
    <text x="1036" y="254" fontSize="7.2" fontWeight="bold" fill={state.allDoorsClosed?'#6bed9e':'#ffd066'}>{doors}</text>
    <text x="1200" y="254" textAnchor="end" fontSize="7.2" fill="#bdc9cb">MCH {state.masterHandle??'—'}</text>
  </g>;
}

export default function CabLiveOverlay({state,previewDetent}){
  return <g className="t2d-live-overlay" pointerEvents="none" aria-hidden="true">
    <Needle cx={619} cy={107} value={state.brakeCylinderPressureKpa} max={1000} color="#ffde4a"/>
    <Needle cx={695} cy={107} value={state.brakePipePressureKpa} max={1000} color="#ef565a"/>
    <Needle cx={780} cy={107} value={state.speed} max={120} color="#8ae27b"/>
    <BrakeBar value={state.brakeCylinderPressureKpa}/>
    {state.allDoorsClosed!==null&&<circle cx="871" cy="95" r="11" fill={state.allDoorsClosed?'#ffe364':'#20252a'} opacity={state.allDoorsClosed?.28:.5}/>}
    {state.emergencyBrake===true&&<circle cx="1076" cy="346" r="18" fill="#ff484f" opacity=".25" className="t2d-emergency-pulse"/>}
    <MasterLever state={state} previewDetent={previewDetent}/>
    <ActiveDetentText state={state} previewDetent={previewDetent}/>
    <TcmsValues state={state}/>
  </g>;
}
