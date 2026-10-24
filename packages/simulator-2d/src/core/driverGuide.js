/**
 * Read-only, educational cab guidance. The Simulation Engine remains the
 * authority for accepting and rejecting commands; this module never changes
 * train state. Warnings use known TRAINEX interlocks and are mirrored by the
 * engine's rejection messages when available.
 */
const NOTICE=(key,title,description,tone='info')=>Object.freeze({key,title,description,tone});
const POWER=new Set(['P1','P2','P3']);
const BRAKING=new Set(['B1','B2','B3']);
const MOVING_THRESHOLD_KMH=0.5;

export function contextualDriverGuide({state={},sessionStatus='IDLE',ready=false}={}){
 if(sessionStatus==='PAUSED') return NOTICE('resume','Simulation paused','Press Resume to continue. Press Resume when you are ready to continue driving.');
 if(!ready || sessionStatus!=='RUNNING') return NOTICE('start','Start your driving session','Press Start in the simulator HUD. Begin with the master handle at N and check the passenger-door indications.');
 if(state.emergencyBrake===true){
  return NOTICE('emergency','Emergency brake active','Return the master handle to N. Bring the train to a standstill before requesting an emergency-brake reset.','warning');
 }
 if(state.doorState==='OPEN' || state.doorState==='OPENING'){
  return NOTICE('doors-open','Secure passenger doors','When door operation is complete, press Close and wait for the All Doors Closed indication before applying traction.','warning');
 }
 if(state.doorState==='CLOSING'){
  return NOTICE('doors-closing','Wait for door closure','Do not apply traction until the All Doors Closed indication confirms that passenger doors are closed.');
 }
 if(typeof state.speed==='number'&&state.speed>MOVING_THRESHOLD_KMH){
  if(POWER.has(state.masterHandle))return NOTICE('accelerating','Traction applied','Monitor speed and the permitted operating conditions. Move the master handle to N to coast or use B1–B3 for service braking.');
  if(BRAKING.has(state.masterHandle))return NOTICE('braking','Service braking','Observe speed reduction and the brake indications. Passenger doors must remain closed while the train is moving.');
  return NOTICE('coasting','Train moving','Observe the speedometer. Select a permitted braking position to slow the train; do not operate passenger doors in motion.');
 }
 if(state.masterHandle!=='N' && state.masterHandle!=null){
  return NOTICE('neutral','Check master handle position','At standstill, return the handle to N before carrying out a passenger-door operation.');
 }
 if(state.allDoorsClosed===false){
  return NOTICE('door-interlock','Check door indications','Do not apply traction. Wait for the All Doors Closed indication or complete the door-closing procedure.','warning');
 }
 return NOTICE('ready','Ready to practice','With the train stopped and doors confirmed closed, try P1 for traction. Select N to coast or B1–B3 to practise service braking.');
}

/** Optional UI-level guidance; the simulation engine remains authoritative. */
export function driverControlWarning(type,{state={},ready=false,value=null}={}){
 if(!ready)return NOTICE('inactive','Start or resume the session','The controls cannot operate until the simulation is running. Press Start or Resume in the cab HUD.','warning');
 const moving=typeof state.speed==='number'&&state.speed>MOVING_THRESHOLD_KMH;
 const power=POWER.has(state.masterHandle);
 if(type==='DOOR_OPEN_REQUEST'){
  if(moving)return NOTICE('door-moving','Cannot open doors while moving','Bring the train to a standstill and set the master handle to N before requesting door opening.','warning');
  if(power)return NOTICE('door-traction','Cannot open doors during traction','Return the master handle to N. Passenger-door opening is unavailable while a power position is selected.','warning');
  if(state.masterHandle!==null && state.masterHandle!=='N')return NOTICE('door-neutral','Set the handle to N','Passenger-door opening requires the master handle to be in the neutral position.','warning');
  if(state.doorState!==null&&state.doorState!=='CLOSED')return NOTICE('door-not-closed','Door opening unavailable','Wait until the passenger doors are fully closed before requesting another opening cycle.','warning');
 }
 if(type==='DOOR_CLOSE_REQUEST'){
  if(state.doorState!==null&&state.doorState!=='OPEN')return NOTICE('door-not-open','Cannot close doors yet','Wait until the doors are fully open before requesting a closing cycle.','warning');
 }
 if(type==='MASTER_HANDLE_SET'){
  if(POWER.has(value)&&state.emergencyBrake===true)return NOTICE('traction-eb','Traction inhibited by emergency brake','The emergency brake is active. Follow the reset conditions before selecting a traction position.','warning');
  if(POWER.has(value)&&state.allDoorsClosed===false)return NOTICE('traction-doors','Traction inhibited: doors not closed','Close the passenger doors and wait for the All Doors Closed indication before applying traction.','warning');
 }
 if(type==='EMERGENCY_BRAKE_RESET'){
  if(moving)return NOTICE('reset-moving','Emergency reset requires standstill','Stop the train before requesting the emergency-brake reset.','warning');
  if(state.masterHandle!==null&&state.masterHandle!=='N')return NOTICE('reset-neutral','Set master handle to N','Return the master handle to neutral before requesting emergency-brake reset.','warning');
 }
 return null;
}

export function guideFromRejection(result){
 if(result?.accepted!==false)return null;
 return NOTICE('rejected','Control operation not permitted',String(result.reason||'The Simulation Engine rejected this command. Check cab conditions.'),'warning');
}
