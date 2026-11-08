import test from 'node:test';
import assert from 'node:assert/strict';
import {TrainSimulationEngine} from '@trainex/simulation-engine';
import {createInputManager} from '@trainex/input-manager';

test('seven-button hardware: independent left and right door banks',async()=>{
  const engine=new TrainSimulationEngine();
  engine.startSession({sessionId:'TRAINEX-7-INPUTS'});
  const manager=createInputManager({getSessionId:()=>engine.getState().sessionId,dispatchCommand:engine.sendCommand});
  let seq=0;
  const press=(controlId,value)=>manager.submit({source:'hardware',sessionId:'TRAINEX-7-INPUTS',deviceId:'esp7',sequence:++seq,controlId,value});
  assert.equal((await press('DOORS_OPEN','LEFT')).accepted,false,'opening requires prior enable');
  assert.equal((await press('DOOR_ENABLE_LEFT',true)).accepted,true);
  assert.equal((await press('DOORS_OPEN','RIGHT')).accepted,false,'right cannot open just because left is enabled');
  assert.equal((await press('DOORS_OPEN','LEFT')).accepted,true);
  assert.equal(engine.getState().leftDoorState,'OPENING');
  assert.equal(engine.getState().rightDoorState,'CLOSED');
  engine.step(3.5);
  assert.equal(engine.getState().leftDoorState,'OPEN');
  assert.equal((await press('DOORS_CLOSE','LEFT')).accepted,true);
  engine.step(3.5);
  assert.equal(engine.getState().leftDoorState,'CLOSED');
  assert.equal((await press('DOOR_ENABLE_RIGHT',true)).accepted,true);
  assert.equal((await press('DOORS_OPEN','RIGHT')).accepted,true);
  assert.equal(engine.getState().leftDoorState,'CLOSED');
  assert.equal(engine.getState().rightDoorState,'OPENING');
  assert.equal((await press('VIGILANCE_ACKNOWLEDGE',true)).accepted,true);
  engine.destroy();
});
