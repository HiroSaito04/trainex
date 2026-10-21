import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createControlInteractionHandler } from '../src/interactions/ControlInteractionHandler.js';
const node = name => ({name,userData:{},parent:null});
test('3D door click forwards normalized command into Input Manager', async () => {
 const calls=[];
 const handler=createControlInteractionHandler({
  getState:()=>({doorState:'CLOSED'}),getSessionId:()=> 'S-1',
  sendInput:async event=>{calls.push(event);return {accepted:true}},
 });
 const result=await handler.activate(node('05_Driver_Controls__INTERACTIVE_LeftDoor_Open_Cap'));
 assert.equal(result.accepted,true);
 assert.deepEqual(calls,[{type:'DOOR_OPEN_REQUEST',value:null,source:'3d',sessionId:'S-1'}]);
});
test('3D emergency cap sends activation; reset is explicit',async()=>{
 const calls=[];
 const handler=createControlInteractionHandler({getState:()=>({emergencyBrake:false}),getSessionId:()=> 'S-2',sendInput:async command=>{calls.push(command);return {accepted:true}}});
 await handler.activate(node('05_Driver_Controls__INTERACTIVE_EmergencyBrake_Cap.001'));
 await handler.submit('EMERGENCY_BRAKE_RESET');
 assert.deepEqual(calls.map(x=>x.type),['EMERGENCY_BRAKE_ACTIVATE','EMERGENCY_BRAKE_RESET']);
});
test('3D master shaft selection sends no unauthorized handle command',async()=>{
 const calls=[];const inspected=[];
 const handler=createControlInteractionHandler({getState:()=>({}),getSessionId:()=> 'S-3',sendInput:e=>{calls.push(e);return {accepted:true}},onInspect:id=>inspected.push(id)});
 await handler.activate(node('05_Driver_Controls__INTERACTIVE_Master_Controller_Shaft'));
 assert.deepEqual(calls,[]);assert.deepEqual(inspected,['MASTER_CONTROL_HANDLE']);
});
test('commands are rejected without a running session',async()=>{
 const handler=createControlInteractionHandler({getState:()=>({}),getSessionId:()=>null,sendInput:()=>{throw Error('should not happen')}});
 const result=await handler.submit('MASTER_HANDLE_SET','TRACTION');assert.equal(result.accepted,false);
});
