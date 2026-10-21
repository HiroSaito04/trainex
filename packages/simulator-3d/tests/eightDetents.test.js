import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CABIN_ANIMATION} from '../src/config/cabinConfig.js';
import {DETENTS,resolveObjectAction} from '../src/config/objectMappings.js';
import {createControlInteractionHandler} from '../src/interactions/ControlInteractionHandler.js';
test('lever pivots toward rear for brake/EB, upright for N, front for power',()=>{
 const angles=CABIN_ANIMATION.masterHandle.angles;
 assert(angles.EB>angles.B3 && angles.B3>angles.B2 && angles.B2>angles.B1 && angles.B1>angles.N);
 assert(angles.N>angles.P1 && angles.P1>angles.P2 && angles.P2>angles.P3);
 assert.equal(angles.N,0);
});
test('all eight in-cab detent plaques map to correct engine commands',async()=>{
 const commands=[];const handler=createControlInteractionHandler({getState:()=>({}),getSessionId:()=> 'S-1',sendInput:async cmd=>{commands.push(cmd);return {accepted:true}}});
 for(const pos of DETENTS){
  const obj={name:`INTERACTIVE_Master_Detent_${pos}`,parent:null,userData:{}};
  assert.equal(resolveObjectAction(obj).kind,'detent');
  assert.equal((await handler.activate(obj)).accepted,true);
 }
 assert.deepEqual(commands.map(c=>c.value),DETENTS);
 assert(commands.every(c=>c.source==='3d' && c.type==='MASTER_HANDLE_SET'));
});
test('physical emergency reset and doors use correct commands',async()=>{
 const commands=[];const handler=createControlInteractionHandler({getState:()=>({emergencyBrake:true}),getSessionId:()=> 'S-2',sendInput:async cmd=>{commands.push(cmd);return {accepted:true}}});
 for(const name of ['INTERACTIVE_EmergencyBrake_Reset_Cap','INTERACTIVE_LeftDoor_Open_Cap','INTERACTIVE_RightDoor_Close_Cap'])assert.equal((await handler.activate({name,parent:null,userData:{}})).accepted,true);
 assert.deepEqual(commands.map(c=>c.type),['EMERGENCY_BRAKE_RESET','DOOR_OPEN_REQUEST','DOOR_CLOSE_REQUEST']);
});
