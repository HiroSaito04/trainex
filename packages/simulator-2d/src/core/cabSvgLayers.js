/**
 * Non-destructive Figma SVG bindings. The original artwork stays byte-for-byte
 * intact. Only DOM visibility, the existing labels' text/fill, and the existing
 * lever/needle transforms are changed in the live same-origin SVG document.
 *
 * Figma IDs are case-sensitive, and some include whitespace, '/', or '-'.
 * Always use getElementById rather than a CSS selector.
 */
import {DISPLAY_DETENTS} from '../config/consoleParts.js';

export const CAB_LAYER_IDS = Object.freeze({
  lever:'LEVER_MASTER-CONTROL',
  needle:'SPEEDOMETER_ARROW',
  bcNeedle:'BREAK_CYLINDER_ARROW',
  bpNeedle:'BRAKE_PIPE_ARROW',
  speed:'TEXT_km/h',
  tmsSpeed:'TEXT_SPEED(MAX120KM/H)',
  date:'TEXT_DATE(CURRENT DATE)',
  time:'TEXT_TIME(CURRENT TIME)',
  session:'TEXT_TRAINEX SIMULATION SESSION ID',
  closedLamp:'All_Doors_Closed_Indicator_Lamp_Light_Up',
  openLamp:'All_Doors_Open_Indicator_Lamp_Light_Up',
  vigilanceLamp:'VIGILANCE_INDICATOR_Lamp_Light_Up',
  ebOn:'EMERGENCY_BREAK_ON', ebOff:'EMERGENCY_BREAK_OFF',
  releaseOn:'EMERGENCY_BREAK_RELEASE_ON', releaseOff:'EMERGENCY_BREAK_RELEASE_OFF',
});

export const CAB_HIT_LAYERS = Object.freeze({
  masterHandle:'MASTER_CONTROL_DESIGN',
  vigilanceButton:'VIGILANCE_BUTTON_DESIGN',
  leftDoorClose:'LEFT_DOOR_CLOSE_BUTTON_DESIGN',
  leftDoorEnable:'LEFT_DOOR_ENABLE_OPEN_BUTTON_DESIGN',
  leftDoorOpen:'LEFT_DOOR_OPEN_BUTTON_DESIGN',
  rightDoorClose:'RIGHT_DOOR_CLOSE_BUTTON_DESIGN',
  rightDoorEnable:'RIGHT_DOOR_ENABLE_OPEN_BUTTON_DESIGN',
  rightDoorOpen:'RIGHT_DOOR_OPEN_BUTTON_DESIGN',
});

const get=(doc,id)=>doc?.getElementById?.(id)??null;
const finite=v=>Number.isFinite(v)?v:0;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

function visible(doc,id,on){
 const element=get(doc,id);
 if(element)element.style.display=on?'':'none';
}
function setText(doc,id,text){
 const el=get(doc,id);
 if(!el)return;
 const spans=Array.from(el.children??[]).filter(child=>child.localName==='tspan');
 if(spans.length){
   spans[0].textContent=String(text);
   for(const span of spans.slice(1))span.textContent='';
 }else el.textContent=String(text);
}
function doorOpen(state,side,carIndex,doorIndex){
 // The engine currently models each side as one door bank. Individual-door
 // overrides are supported if a later version supplies them.
 const custom=state?.[`${side.toLowerCase()}DoorStatesByCar`]?.[carIndex]?.[doorIndex];
 const status=custom??state?.[`${side.toLowerCase()}DoorState`];
 return status==='OPEN'||status==='OPENING'||status==='CLOSING';
}
function setHandle(doc,position){
 const active=DISPLAY_DETENTS.includes(position)?position:'N';
 for(const notch of DISPLAY_DETENTS){
  const text=get(doc,`TEXT_${notch}`);
  if(text)text.setAttribute('fill',notch===active?'#FFDB3D':'#6B6E70');
 }
 const lever=get(doc,CAB_LAYER_IDS.lever);
 const activeLabel=get(doc,`TEXT_${active}`);
 const neutralLabel=get(doc,'TEXT_N');
 const y=label=>Number(label?.querySelector?.('tspan')?.getAttribute('y'));
 if(lever && Number.isFinite(y(activeLabel)) && Number.isFinite(y(neutralLabel))){
  lever.setAttribute('transform',`translate(0 ${((y(activeLabel)-y(neutralLabel))).toFixed(3)})`);
 }
}
function setSpeed(doc,speed){
 const value=clamp(finite(speed),0,120);
 setText(doc,CAB_LAYER_IDS.speed,`${Math.round(value)} km/h`);
 setText(doc,CAB_LAYER_IDS.tmsSpeed,`${value.toFixed(1)}km/h`);
 const needle=get(doc,CAB_LAYER_IDS.needle);
 // The existing 0 km/h arrow artwork points down-left. Rotate around its
 // original dial pivot; no new needle or dial is drawn.
 if(needle)needle.setAttribute('transform',`rotate(${(value/120*250).toFixed(3)} 4552 342.002)`);
}
function setDoorGraphics(doc,state){
 for(const side of ['left','right']){
  for(let car=1;car<=8;car++){
   for(let door=1;door<=4;door++){
    const id=`Open_Cab${String(car).padStart(2,'0')}_${side}_Door${door}`;
    visible(doc,id,doorOpen(state,side,car-1,door-1));
   }
  }
 }
}
export function formatCabClock(date=new Date()){
 return {
  date:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',day:'2-digit',month:'2-digit',year:'numeric'}).format(date),
  time:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(date),
 };
}
export function applyCabSvgLayers(doc,{state={},previewDetent=null,sessionId=null,sessionStatus='IDLE',clock=new Date()}={}){
 if(!doc?.getElementById)return false;
 const active=sessionStatus==='RUNNING'||sessionStatus==='PAUSED';
 const speed=finite(state.speed);
 setSpeed(doc,speed);
 setHandle(doc,previewDetent??state.masterHandle??'N');
 const doorClosed=active && state.allDoorsClosed===true;
 const doorOpenNow=active && (['OPEN','OPENING','CLOSING'].includes(state.leftDoorState)||
 ['OPEN','OPENING','CLOSING'].includes(state.rightDoorState));
 visible(doc,CAB_LAYER_IDS.closedLamp,doorClosed);
 visible(doc,CAB_LAYER_IDS.openLamp,doorOpenNow);
 visible(doc,CAB_LAYER_IDS.vigilanceLamp,active && (state.vigilanceWarning===true||state.vigilanceBuzzer===true||state.vigilanceTrip===true));
 visible(doc,CAB_LAYER_IDS.ebOn,active&&state.emergencyBrake===true);
 visible(doc,CAB_LAYER_IDS.ebOff,!active||state.emergencyBrake!==true);
 visible(doc,CAB_LAYER_IDS.releaseOn,active&&state.emergencyBrakeReleasing===true);
 visible(doc,CAB_LAYER_IDS.releaseOff,!active||state.emergencyBrakeReleasing!==true);
 setDoorGraphics(doc,active?state:{});
 const now=formatCabClock(clock);
 setText(doc,CAB_LAYER_IDS.date,now.date);
 setText(doc,CAB_LAYER_IDS.time,now.time);
 setText(doc,CAB_LAYER_IDS.session,sessionId||'NO SESSION');
 return true;
}

/** Shape bounds in the original 8784x4215 design coordinate system. */
export function findCabLayerBounds(doc,{width=1800,sourceWidth=8784}={}){
 const bounds={};
 const factor=width/sourceWidth;
 for(const [part,id] of Object.entries(CAB_HIT_LAYERS)){
  const node=get(doc,id);
  if(!node?.getBBox)continue;
  try{
   const b=node.getBBox();
   if(!(b.width>0&&b.height>0))continue;
   bounds[part]={kind:'rect',x:b.x*factor,y:b.y*factor,w:b.width*factor,h:b.height*factor,rx:2};
  }catch{/* Retain the premeasured fallback hit shape. */}
 }
 return bounds;
}

export const EXPECTED_DYNAMIC_LAYERS=Object.freeze([
 ...Object.values(CAB_LAYER_IDS),
 ...DISPLAY_DETENTS.map(n=>`TEXT_${n}`),
 ...Object.values(CAB_HIT_LAYERS),
 ...Array.from({length:8},(_,i)=>['left','right'].flatMap(side=>Array.from({length:4},(_,j)=>`Open_Cab${String(i+1).padStart(2,'0')}_${side}_Door${j+1}`))).flat(),
]);
