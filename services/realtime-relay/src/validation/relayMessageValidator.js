import {MASTER_HANDLE_POSITIONS,HARDWARE_CONTROL_IDS} from '@trainex/contracts';
import {validSessionId} from '../authentication/sessionAuthentication.js';
const controls=new Set(Object.values(HARDWARE_CONTROL_IDS));
export function validateDeviceInput(msg,deviceId){
 if(!msg||msg.type!=='input'||msg.deviceId!==deviceId||!validSessionId(msg.sessionId)||!Number.isSafeInteger(msg.sequence)||msg.sequence<0)return {valid:false,reason:'Invalid input envelope'};
 if(!controls.has(msg.controlId))return {valid:false,reason:'Unsupported control'};
 if(msg.controlId==='MASTER_HANDLE'&&!MASTER_HANDLE_POSITIONS.includes(msg.value))return {valid:false,reason:'Invalid master handle detent'};
 if(msg.value!=null && typeof msg.value!=='string' && typeof msg.value!=='boolean')return {valid:false,reason:'Invalid input value'};
 return {valid:true};
}
