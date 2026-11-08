import {MASTER_HANDLE_POSITIONS} from '@trainex/contracts';
const HANDLES=new Set(MASTER_HANDLE_POSITIONS);
const COMMANDS=new Set(['MASTER_HANDLE_SET','EMERGENCY_BRAKE_ACTIVATE','EMERGENCY_BRAKE_RELEASE',
 'DOOR_ENABLE_SET','DOOR_OPEN_REQUEST','DOOR_CLOSE_REQUEST','VIGILANCE_ACKNOWLEDGE']);
const reject=reason=>({accepted:false,reason});
export function processCommand(state,command,{doors,rules}){
 if(!command || typeof command!=='object' || Array.isArray(command))return reject('Command must be an object.');
 if(!COMMANDS.has(command.type))return reject('Unsupported command type.');
 let next=state;
 switch(command.type){
 case 'MASTER_HANDLE_SET':{
  if(!HANDLES.has(command.value))return reject('Unsupported master handle position.');
  if(command.value.startsWith('P')&&state.emergencyBrake)return reject('Release emergency braking before traction.');
  if(command.value.startsWith('P')&&rules.requireDoorsClosedForTraction&&!state.allDoorsClosed)return reject('All passenger doors must be secured before traction.');
  next={...state,masterHandle:command.value};
  if(command.value!==state.masterHandle&&!state.vigilanceTrip)next={...next,vigilanceElapsedSeconds:0,vigilanceWarning:false,vigilanceBuzzer:false};
  if(command.value==='EB')next={...next,emergencyBrake:true,emergencyBrakeReleasing:false,emergencyReleaseElapsed:0};
  break;
 }
 case 'EMERGENCY_BRAKE_ACTIVATE':
  if(state.emergencyBrake)return reject('Emergency brake already active.');
  next={...state,emergencyBrake:true,emergencyBrakeReleasing:false,emergencyReleaseElapsed:0};break;
 case 'EMERGENCY_BRAKE_RELEASE':
  if(!state.emergencyBrake)return reject('Emergency braking is not active.');
  if(state.emergencyBrakeReleasing)return reject('Emergency brake release already in progress.');
  if(state.speed>doors.stoppedThresholdKmh)return reject('Emergency brake release requires the train to stop.');
  if(state.masterHandle!=='N')return reject('Return the master handle to N before releasing emergency brake.');
  next={...state,emergencyBrakeReleasing:true,emergencyReleaseElapsed:0};break;
 case 'VIGILANCE_ACKNOWLEDGE':
  next={...state,vigilanceElapsedSeconds:0,vigilanceWarning:false,vigilanceBuzzer:false,vigilanceTrip:false};
  // Acknowledgement does not automatically release already-applied penalty EB.
  break;
 case 'DOOR_ENABLE_SET':{
  if(!['LEFT','RIGHT'].includes(command.value))return reject('Select LEFT or RIGHT door bank to enable.');
  if(state.speed>doors.stoppedThresholdKmh)return reject('Doors cannot be enabled while moving.');
  if(state.masterHandle!=='N')return reject('Set master handle to N before enabling doors.');
  const own=command.value.toLowerCase(),other=own==='left'?'right':'left';
  if(state[`${own}DoorState`]!=='CLOSED')return reject('Enable door bank before opening.');
  next={...state,[`${own}DoorEnabled`]:!state[`${own}DoorEnabled`],[`${other}DoorEnabled`]:false};break;
 }
 case 'DOOR_OPEN_REQUEST':{
  if(state.speed>doors.stoppedThresholdKmh)return reject('Doors cannot open while train is moving.');
  if(state.masterHandle!=='N')return reject('Set master handle to N before opening doors.');
  const sides=command.value==='LEFT'?['left']:command.value==='RIGHT'?['right']:
    ['left','right'].filter(side=>state[`${side}DoorEnabled`]);
  if(!sides.length)return reject('Select ENABLE on the required door side first.');
  for(const side of sides){
   if(!state[`${side}DoorEnabled`])return reject(`Enable ${side} doors before opening.`);
   if(state[`${side}DoorState`]!=='CLOSED')return reject('Door bank must be fully closed before opening.');
  }
  next={...state};for(const side of sides)next[`${side}DoorState`]='OPENING';break;
 }
 case 'DOOR_CLOSE_REQUEST':{
  const sides=command.value==='LEFT'?['left']:command.value==='RIGHT'?['right']:
   ['left','right'].filter(side=>state[`${side}DoorState`]!=='CLOSED');
  if(!sides.length)return reject('Doors are already closed.');
  if(sides.some(side=>!['OPEN','OPENING','CLOSING','CLOSED'].includes(state[`${side}DoorState`])))return reject('Unknown door state.');
  next={...state};for(const side of sides){if(next[`${side}DoorState`]!=='CLOSED')next[`${side}DoorState`]='CLOSING';}break;
 }
 }
 return {accepted:true,nextState:next,type:command.type};
}
