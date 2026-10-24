import {useCallback,useState} from 'react';
import {dispatchCabCommand} from '../core/cabCommands.js';

export function useCabControls({sendInput,sessionId,ready}){
 const [feedback,setFeedback]=useState('');
 const execute=useCallback(async (type,value=null)=>{
   const result=await dispatchCabCommand(sendInput,type,{value,sessionId,ready});
   setFeedback(result?.accepted===true
     ? (type==='MASTER_HANDLE_SET'?`Master handle set to ${value}.`:'Command accepted by the Simulation Engine.')
     : result?.reason??'Command rejected by the Simulation Engine.');
   return result;
 },[ready,sendInput,sessionId]);
 return {
   feedback,setFeedback,
   setMasterHandle:position=>execute('MASTER_HANDLE_SET',position),
   openDoors:()=>execute('DOOR_OPEN_REQUEST'),
   closeDoors:()=>execute('DOOR_CLOSE_REQUEST'),
   activateEmergency:()=>execute('EMERGENCY_BRAKE_ACTIVATE'),
   resetEmergency:()=>execute('EMERGENCY_BRAKE_RESET'),
 };
}
