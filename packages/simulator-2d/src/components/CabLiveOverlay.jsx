import {DISPLAY_DETENTS} from '../config/consoleParts.js';
import {useAnimatedValue} from '../hooks/useAnimatedValue.js';
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function Gauge({cx,cy,value,max,color}){
 const reading=useAnimatedValue(value,180);if(!Number.isFinite(reading))return null;
 const theta=(-125+250*clamp(reading/max,0,1))*Math.PI/180;
 const dx=Math.sin(theta)*20,dy=-Math.cos(theta)*20;
 return <g><line x1={cx} y1={cy} x2={cx+dx} y2={cy+dy} stroke={color} strokeWidth="2.7" strokeLinecap="round"/>
 <circle cx={cx} cy={cy} r="3" fill="#cbd5db"/></g>;
}
const DOOR_COLORS=Object.freeze({CLOSED:'#d9e2e6',OPEN:'#ffd42d',OPENING:'#ffd42d',CLOSING:'#ffd42d',FAULT:'#fa313d',UNKNOWN:'#25282b'});
function TmsDoorBank({side,state}){
 const doorState=side==='LEFT'?state.leftDoorState:state.rightDoorState;
 const active=doorState||'UNKNOWN';const fill=DOOR_COLORS[active]||DOOR_COLORS.UNKNOWN;
 // The source SVG draws train cars diagonally. Top row is LEFT; lower row RIGHT.
 const top=side==='LEFT';
 return <g className={`t2d-tms-door-${side.toLowerCase()}`}>
 {Array.from({length:8},(_,i)=>{
   const x=(top?1273:1261)+i*21.2;
   const y=(top?131:173)+i*3.30;
   return <g key={i}>
    {Array.from({length:3},(_,j)=><polygon key={j} points={`${x+j*5.4},${y+j*.75} ${x+4.7+j*5.4},${y+1.35+j*.75} ${x+3.6+j*5.4},${y+12.5+j*.75} ${x-1+j*5.4},${y+11.15+j*.75}`}
       fill={fill} fillOpacity={active==='CLOSED'?0.94:1} stroke="#202629" strokeWidth=".8"/>)}
   </g>;
 })}
 </g>;
}
function Lamp({cx,cy,on,color,r=12}){
 if(!on)return null;
 return <g className="t2d-illuminated-indicator">
 <circle cx={cx} cy={cy} r={r+7} fill={color} opacity=".12"/>
 <circle cx={cx} cy={cy} r={r+2} fill={color} opacity=".23"/>
 <circle cx={cx} cy={cy} r={r} fill={color} opacity=".82"/>
 <ellipse cx={cx-4} cy={cy-5} rx={r*.52} ry={r*.24} fill="#fff" opacity=".43"/>
 </g>;
}
function TmsReadout({state}){
 if(!Number.isFinite(state.speed))return null;
 const doorsLabel=state.allDoorsClosed?'ALL DOORS SECURED':'DOOR INTERLOCK OPEN';
 return <g aria-label="Live train state" transform="rotate(10 1290 255)">
  <rect x="1190" y="188" width="176" height="16" fill="#020405"/>
  <text x="1196" y="200" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="11"
    fill={state.allDoorsClosed?'#d8e6ed':'#ffd36d'}>{doorsLabel}</text>
  <rect x="1210" y="218" width="150" height="24" fill="#040607"/>
  <text x="1218" y="234" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="13" fill="#f5f8f9">
    {state.speed.toFixed(1)} km/h</text>
  <rect x="1380" y="224" width="106" height="31" fill="#030506"/>
  <text x="1383" y="235" fontFamily="Arial,sans-serif" fontSize="10" fontWeight="700"
    fill={state.emergencyBrake?'#ff686f':'#88ecb0'}>{state.emergencyBrake?'EB ACTIVE':'EB CLEAR'}</text>
  <text x="1383" y="248" fontFamily="Arial,sans-serif" fontSize="9"
    fill={state.emergencyBrakeReleasing?'#ffdc7d':'#b7c7cf'}>
    {state.emergencyBrakeReleasing?'RELEASING':'RELEASE READY'}</text>
 </g>;
}
function MasterPosition({state,previewDetent}){
 const active=previewDetent??state.masterHandle??'N';
 const index=DISPLAY_DETENTS.indexOf(active);if(index<0)return null;
 // A small illuminated marker beside the thirteen existing SVG detent labels.
 return <g><rect x="891" y={325+index*11.7} width="4" height="9" rx="2" fill="#f9d832"/>
 <rect x="813" y={368+index*.2} width="38" height="22" rx="7" fill="#2a3034" stroke="#b7c0c3" strokeWidth="1.5" opacity=".96"/></g>;
}
export default function CabLiveOverlay({state,previewDetent}){
 return <g className="t2d-live-overlay" pointerEvents="none" aria-hidden="true">
  <Gauge cx={705} cy={69} value={state.brakeCylinderPressureKpa} max={1000} color="#ffe358"/>
  <Gauge cx={802} cy={69} value={state.brakePipePressureKpa} max={1000} color="#ff555d"/>
  <Gauge cx={929} cy={67} value={state.speed} max={120} color="#86e084"/>
  <Lamp cx={1032} cy={52} on={(state.leftDoorEnabled&&state.leftDoorState==='OPEN')||(state.rightDoorEnabled&&state.rightDoorState==='OPEN')} color="#ffe47b" r={12}/>
  <Lamp cx={1111} cy={52} on={state.allDoorsClosed===true} color="#ffe47b" r={12}/>
  <Lamp cx={931} cy={244} on={state.emergencyBrake===true} color="#ff5555" r={10}/>
  <Lamp cx={980} cy={244} on={state.departureAuthorized===true} color="#38e993" r={10}/>
  <Lamp cx={1031} cy={244} on={state.stationStop===true} color="#ffd94d" r={10}/>
  <Lamp cx={595} cy={440} on={state.leftDoorEnabled===true} color="#f9dc4b" r={12}/>
  <Lamp cx={1185} cy={442} on={state.rightDoorEnabled===true} color="#f9dc4b" r={12}/>
  <TmsDoorBank side="LEFT" state={state}/><TmsDoorBank side="RIGHT" state={state}/>
  <TmsReadout state={state}/>
  <MasterPosition state={state} previewDetent={previewDetent}/>
 </g>;
}
