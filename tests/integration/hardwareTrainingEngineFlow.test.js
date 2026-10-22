import test from 'node:test';
import assert from 'node:assert/strict';
import {TrainSimulationEngine} from '@trainex/simulation-engine';
import {InputManager} from '@trainex/input-manager';
import {TrainingManager} from '@trainex/training-module';
import {HardwareClient} from '@trainex/hardware-client';

test('paired ESP32 input shares engine and advances training safely',async()=>{
 const engine=new TrainSimulationEngine();
 engine.startSession({sessionId:'TRAINEX-hardware-integration'});
 const input=new InputManager({dispatchCommand:engine.sendCommand,getSessionId:()=>engine.getState().sessionId});
 const training=new TrainingManager({getSessionId:()=>engine.getState().sessionId,getTrainState:engine.getState});
 training.start('doorClosing');
 const callbacks=[];
 const transport={connect:async()=>{},close:async()=>{},onMessage:fn=>(callbacks.push(fn),()=>{}),send:()=>{}};
 const proxy={submit:async event=>{
   const result=await input.submit(event);
   const mapping={MASTER_HANDLE:'MASTER_HANDLE_SET',DOORS_OPEN:'DOOR_OPEN_REQUEST',DOORS_CLOSE:'DOOR_CLOSE_REQUEST'};
   training.recordCommand({type:mapping[event.controlId],value:event.value,source:'hardware'},result);
   return result;
 }};
 const client=new HardwareClient({transport,inputManager:proxy,getSessionId:()=>engine.getState().sessionId,getTrainState:engine.getState,mode:'wss',browserToken:'unit-test-browser-token'});
 await client.connect();
 const push=async m=>{for(const fn of callbacks)await fn(JSON.stringify(m))};
 await push({type:'paired',deviceId:'esp1',sessionId:'TRAINEX-hardware-integration'});
 let seq=0;
 const key=async(controlId,value)=>push({type:'input',deviceId:'esp1',sessionId:'TRAINEX-hardware-integration',sequence:++seq,controlId,value});
 await key('MASTER_HANDLE','N');assert.equal(training.getState().stepIndex,1);
 await key('DOORS_OPEN');assert.equal(engine.getState().doorState,'OPENING');assert.equal(training.getState().stepIndex,2);
 engine.step(3);training.onStateChange();assert.equal(training.getState().stepIndex,3);
 await key('DOORS_CLOSE');assert.equal(training.getState().stepIndex,4);
 engine.step(4);training.onStateChange();assert.equal(training.getState().status,'COMPLETED');
 assert.equal(engine.getState().allDoorsClosed,true);
 await client.destroy();engine.destroy();
});
