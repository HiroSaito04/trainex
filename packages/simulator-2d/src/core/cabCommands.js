import {MASTER_POSITIONS} from '../config/consoleParts.js';
const TYPES=new Set(['MASTER_HANDLE_SET','DOOR_ENABLE_SET','DOOR_OPEN_REQUEST','DOOR_CLOSE_REQUEST','EMERGENCY_BRAKE_ACTIVATE','EMERGENCY_BRAKE_RELEASE','VIGILANCE_ACKNOWLEDGE']);
export function createCabCommand(type,{value=null,sessionId=null}={}){
 if(!TYPES.has(type))throw new RangeError(`Unsupported 2D command: ${type}`);
 if(type==='MASTER_HANDLE_SET'&&!MASTER_POSITIONS.includes(value))throw new RangeError('Unsupported master-handle position.');
 return Object.freeze({source:'2d',type,value,sessionId});
}
export async function dispatchCabCommand(sendInput,type,{value=null,sessionId=null,ready=false}={}){
 if(!ready||!sessionId||typeof sendInput!=='function')return {accepted:false,reason:'Start or resume your train session first.'};
 try{return await sendInput(createCabCommand(type,{value,sessionId}));}
 catch(e){return {accepted:false,reason:e?.message??'Command could not be sent.'};}
}
