import {MASTER_POSITIONS} from '../config/consoleParts.js';

const CONTROL_TYPES=new Set(['MASTER_HANDLE_SET','DOOR_OPEN_REQUEST','DOOR_CLOSE_REQUEST','EMERGENCY_BRAKE_ACTIVATE','EMERGENCY_BRAKE_RESET']);

export function createCabCommand(type,{value=null,sessionId=null}={}){
  if(!CONTROL_TYPES.has(type))throw new RangeError(`Unsupported 2D simulator command: ${type}`);
  if(type==='MASTER_HANDLE_SET' && !MASTER_POSITIONS.includes(value))throw new RangeError('Unsupported master-handle position.');
  return Object.freeze({source:'2d',type,value:type==='MASTER_HANDLE_SET'?value:null,sessionId});
}
export async function dispatchCabCommand(sendInput,type,{value=null,sessionId=null,ready=false}={}){
  if(!ready || sessionId==null || typeof sendInput!=='function')return {accepted:false,reason:'Start or resume the simulation session to operate the cab.'};
  try{
    return await sendInput(createCabCommand(type,{value,sessionId}));
  }catch(error){return {accepted:false,reason:error instanceof Error?error.message:'Unable to send the command.'};}
}
