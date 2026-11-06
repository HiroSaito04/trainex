import {MASTER_HANDLE_POSITIONS,HARDWARE_CONTROL_IDS} from '@trainex/contracts';
import {validSessionId} from '../authentication/sessionAuthentication.js';
const controls=new Set([...Object.values(HARDWARE_CONTROL_IDS),'HORN','VIGILANCE_ACK']);
const BUTTONS=new Set(['EMERGENCY_BRAKE','EMERGENCY_BRAKE_RESET','DOORS_OPEN','DOORS_CLOSE','HORN','VIGILANCE_ACK']);
export function validateDeviceInput(msg,deviceId) {
  if (!msg || msg.type!=='input' || msg.deviceId!==deviceId ||
      !validSessionId(msg.sessionId) || !Number.isSafeInteger(msg.sequence) || msg.sequence<0)
    return {valid:false,reason:'Invalid input envelope'};
  if(!controls.has(msg.controlId))return {valid:false,reason:'Unsupported control'};
  if(msg.controlId==='MASTER_HANDLE' && !MASTER_HANDLE_POSITIONS.includes(msg.value))
    return {valid:false,reason:'Invalid master handle detent'};
  if(BUTTONS.has(msg.controlId) && typeof msg.value!=='boolean')
    return {valid:false,reason:'Button event must be boolean'};
  return {valid:true};
}
