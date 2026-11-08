import {MASTER_HANDLE_POSITIONS,HARDWARE_CONTROL_IDS} from '@trainex/contracts';
import {validSessionId} from '../authentication/sessionAuthentication.js';
const controls = new Set(['MASTER_HANDLE','DOOR_ENABLE_LEFT','DOOR_ENABLE_RIGHT','DOORS_OPEN','DOORS_CLOSE','VIGILANCE_ACKNOWLEDGE']);
const sideValues = new Set(['LEFT','RIGHT']);
const isDoorCommand = id => id === HARDWARE_CONTROL_IDS.DOORS_OPEN || id === HARDWARE_CONTROL_IDS.DOORS_CLOSE;
export function validateDeviceInput(msg, deviceId) {
  if (!msg || msg.type !== 'input' || msg.deviceId !== deviceId ||
      !validSessionId(msg.sessionId) || !Number.isSafeInteger(msg.sequence) || msg.sequence < 0)
    return {valid:false, reason:'Invalid input envelope'};
  if (!controls.has(msg.controlId)) return {valid:false,reason:'Unsupported control'};
  if (msg.controlId === HARDWARE_CONTROL_IDS.MASTER_HANDLE)
    return MASTER_HANDLE_POSITIONS.includes(msg.value)
      ? {valid:true} : {valid:false,reason:'Invalid master handle detent'};
  if (isDoorCommand(msg.controlId))
    return sideValues.has(msg.value)
      ? {valid:true} : {valid:false,reason:'Door event must specify LEFT or RIGHT'};
  return msg.value === true
    ? {valid:true} : {valid:false,reason:'This control accepts press-only true events'};
}
