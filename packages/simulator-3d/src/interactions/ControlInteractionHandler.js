import {resolveObjectAction,resolveComponentId} from '../config/objectMappings.js';
export function createControlInteractionHandler({getState,getSessionId,sendInput,onInspect,onFeedback}){
 async function submit(type,value=null){
  if(typeof sendInput!=='function'){onFeedback?.('Input Manager unavailable.');return {accepted:false,reason:'Input Manager unavailable.'}}
  const sessionId=getSessionId?.();
  if(!sessionId){onFeedback?.('Start the train session first.');return {accepted:false,reason:'No active session.'}}
  try{
   const result=await sendInput({type,value,source:'3d',sessionId});
   onFeedback?.(result?.accepted?'Command accepted.':result?.reason??'Command rejected.');return result;
  }catch(e){const result={accepted:false,reason:e?.message??'Command failed.'};onFeedback?.(result.reason);return result;}
 }
 async function activate(object){
  const action=resolveObjectAction(object);const component=action?.componentId??resolveComponentId(object);if(component)onInspect?.(component);
  if(!action)return {accepted:false,reason:'Not a simulator control.'};
  if(action.kind==='select')return {accepted:false,reason:'Drag the existing master handle to select a detent.'};
  const state=getState?.();const data=state?.display??state??{};
  if(action.type==='EMERGENCY_BRAKE_ACTIVATE' && data.emergencyBrake)return {accepted:false,reason:'Emergency already active.'};
  return submit(action.type,action.value??null);
 }
 return {activate,submit,getState};
}
