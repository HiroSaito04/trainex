import {HARDWARE_CONTROL_IDS,MASTER_HANDLE_POSITIONS,validateHardwareInput} from '@trainex/contracts';
const CONTROL_SET=new Set(Object.values(HARDWARE_CONTROL_IDS));
const HANDLE_SET=new Set(MASTER_HANDLE_POSITIONS);
export function validateInboundHardwareMessage(msg,{deviceId,sessionId}={}){
  if(!msg||msg.type!=='input')return {valid:false,reason:'Expected an input message.'};
  const controlId=msg.controlId??msg.control;
  if(!CONTROL_SET.has(controlId))return {valid:false,reason:'Unknown hardware control.'};
  const clean={deviceId:msg.deviceId,sessionId:msg.sessionId,sequence:msg.sequence,controlId,value:msg.value};
  const check=validateHardwareInput(clean);
  if(!check.valid)return check;
  if(!sessionId||msg.sessionId!==sessionId)return {valid:false,reason:'Inactive or mismatched session.'};
  if(deviceId&&msg.deviceId!==deviceId)return {valid:false,reason:'Mismatched device.'};
  if(controlId===HARDWARE_CONTROL_IDS.MASTER_HANDLE&&!HANDLE_SET.has(msg.value))return {valid:false,reason:'Invalid handle detent.'};
  return {valid:true,event:{...clean,source:'hardware'}};
}
