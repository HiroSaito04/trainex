import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createEngine} from '@trainex/simulation-engine';
import {createInputManager} from '@trainex/input-manager';
import {createControlInteractionHandler} from '../../packages/simulator-3d/src/interactions/ControlInteractionHandler.js';
const node=name=>({name,parent:null,userData:{}});
test('3D physical controls -> input manager -> same engine state used by 2D',async()=>{
 const engine=createEngine({autoTick:false});
 const input=createInputManager({dispatchCommand:cmd=>engine.sendCommand(cmd),getSessionId:()=>engine.getSessionInfo().sessionId});
 const started=engine.startSession();assert.equal(started.accepted,true);
 const three=createControlInteractionHandler({getState:()=>engine.getState(),getSessionId:()=>engine.getSessionInfo().sessionId,sendInput:e=>input.submit(e)});
 assert.equal((await three.activate(node('INTERACTIVE_LeftDoor_Open_Cap'))).accepted,true);
 assert.equal(engine.getState().doorState,'OPENING');assert.equal(engine.getState().allDoorsClosed,false);
 engine.step(2.6);assert.equal(engine.getState().doorState,'OPEN');
 assert.equal((await three.activate(node('INTERACTIVE_Master_Detent_P3'))).accepted,false);
 assert.equal((await three.activate(node('INTERACTIVE_RightDoor_Close_Cap'))).accepted,true);
 engine.step(3.2);assert.equal(engine.getState().doorState,'CLOSED');
 assert.equal(engine.getState().allDoorsClosed,true);
 assert.equal((await three.activate(node('INTERACTIVE_Master_Detent_P2'))).accepted,true);
 engine.step(2);const speed=engine.getState().speed;assert(speed>0);
 // Brake step B3 must decelerate the same authoritative state.
 assert.equal((await three.activate(node('INTERACTIVE_Master_Detent_B3'))).accepted,true);
 engine.step(.5);assert(engine.getState().speed<speed);
 assert.equal((await three.activate(node('INTERACTIVE_EmergencyBrake_Cap'))).accepted,true);
 assert.equal(engine.getState().emergencyBrake,true);
 // The 2D console reads the same snapshot, not another train instance.
 assert.equal(engine.getState().display.emergencyBrake,true);
 const rejected=await three.activate(node('INTERACTIVE_EmergencyBrake_Reset_Cap'));
 assert.equal(rejected.accepted,false); // cannot reset while moving or while handle not N
 engine.destroy();
});
