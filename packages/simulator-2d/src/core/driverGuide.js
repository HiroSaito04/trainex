const NOTICE=(key,title,description,tone='info')=>Object.freeze({key,title,description,tone});
const POWER=new Set(['P1','P2','P3','P4']);
const BRAKE=new Set(['B1','B2','B3','B4','B5','B6','B7']);
export function contextualDriverGuide({state={},sessionStatus='IDLE',ready=false}={}){
 if(sessionStatus==='PAUSED')return NOTICE('pause','Simulation paused','Press Resume to continue driving.');
 if(!ready||sessionStatus!=='RUNNING')return NOTICE('start','Start your session','Press Start in the session toolbar.');
 if(state.emergencyBrake)return NOTICE('eb','Emergency braking',state.emergencyBrakeReleasing?'Releasing emergency brake pressure…':'Stop the train, return handle to N, then use Emergency Brake Release on TMS.','warning');
 if(!state.allDoorsClosed)return NOTICE('doors','Passenger door interlock','Close and secure both sides before applying traction.','warning');
 if(state.speed>0.5){if(POWER.has(state.masterHandle))return NOTICE('traction','Traction applied','Monitor train speed and permitted conditions.');
 if(BRAKE.has(state.masterHandle))return NOTICE('braking','Service braking','Monitor train speed while braking.');
 return NOTICE('coasting','Coasting','Use service braking to slow down.');}
 return NOTICE('ready','Ready to practise','Enable a door side while stopped, then open/close; or select P1 to depart.');
}
export function driverControlWarning(type,{state={},ready=false,value=null}={}){
 if(!ready)return NOTICE('inactive','Start or resume session','Train controls require a running session.','warning');
 if(type==='DOOR_ENABLE_SET'||type==='DOOR_OPEN_REQUEST'){
  if(state.speed>0.05)return NOTICE('door-moving','Train moving','Stop before enabling or opening doors.','warning');
  if(state.masterHandle!=='N')return NOTICE('door-neutral','Master handle not neutral','Return handle to N before opening doors.','warning');
  if(type==='DOOR_OPEN_REQUEST'&&!state[`${String(value).toLowerCase()}DoorEnabled`])return NOTICE('door-enable','Enable this side first','Press ENABLE for the same side before OPEN.','warning');
 }
 if(type==='MASTER_HANDLE_SET'&&POWER.has(value)&&(state.emergencyBrake||!state.allDoorsClosed))return NOTICE('traction-blocked','Traction inhibited','Release emergency brake and secure all doors before applying traction.','warning');
 if(type==='EMERGENCY_BRAKE_RELEASE'&&(state.speed>0.05||state.masterHandle!=='N'))return NOTICE('release-unavailable','Emergency brake release unavailable','Stop the train and set the handle to N before releasing.','warning');
 return null;
}
export function guideFromRejection(result){return result?.accepted===false?NOTICE('rejected','Operation not permitted',String(result.reason||'Command rejected.'),'warning'):null;}
