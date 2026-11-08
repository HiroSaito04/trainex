import {useCallback,useState} from 'react';
import {dispatchCabCommand} from '../core/cabCommands.js';
export function useCabControls({sendInput,sessionId,ready}){
 const [feedback,setFeedback]=useState('');
 const execute=useCallback(async(type,value=null)=>{
  const result=await dispatchCabCommand(sendInput,type,{value,sessionId,ready});
  setFeedback(result?.accepted?`Command accepted: ${type}${value?` ${value}`:''}.`:result?.reason??'Command rejected.');
  return result;
 },[ready,sendInput,sessionId]);
 return {feedback,setFeedback,
  setMasterHandle:value=>execute('MASTER_HANDLE_SET',value),
  enableDoors:side=>execute('DOOR_ENABLE_SET',side),
  openDoors:side=>execute('DOOR_OPEN_REQUEST',side),
  closeDoors:side=>execute('DOOR_CLOSE_REQUEST',side),
  activateEmergency:()=>execute('EMERGENCY_BRAKE_ACTIVATE'),
  releaseEmergency:()=>execute('EMERGENCY_BRAKE_RELEASE'),
  acknowledgeVigilance:()=>execute('VIGILANCE_ACKNOWLEDGE'),
 };
}
