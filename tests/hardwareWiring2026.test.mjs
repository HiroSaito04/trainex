import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateHardwareInput,makeHardwareFeedback,MASTER_HANDLE_POSITIONS} from '../packages/contracts/src/index.js';
import {createInputManager} from '../packages/input-manager/src/index.js';
import {TrainSimulationEngine} from '../packages/simulation-engine/src/core/TrainSimulationEngine.js';
import {validateDeviceInput} from '../services/realtime-relay/src/validation/relayMessageValidator.js';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('AS5600 I2C pins and 5 core button pins are distinct; no 8-pin rotary input',()=>{
 const c=read('hardware/esp32/include/TrainexHardwareConfig.h');
 const m=Object.fromEntries([...c.matchAll(/^#define TRAINEX_(AS5600_SDA|AS5600_SCL|PIN_VIGILANCE|PIN_EB_RELEASE|PIN_DOOR_OPEN|PIN_DOOR_CLOSE|PIN_HORN|PIN_BUZZER_DRIVER)\s+(\d+)/gm)].map(x=>[x[1],+x[2]]));
 assert.deepEqual(m,{AS5600_SDA:21,AS5600_SCL:22,PIN_VIGILANCE:23,PIN_EB_RELEASE:25,PIN_DOOR_OPEN:26,PIN_DOOR_CLOSE:27,PIN_HORN:33,PIN_BUZZER_DRIVER:32});
 assert.equal(new Set(Object.values(m)).size,8);
 assert.match(read('hardware/esp32/src/main.cpp'),/Wire\.begin\(TRAINEX_AS5600_SDA,TRAINEX_AS5600_SCL\)/);
 assert.doesNotMatch(read('hardware/esp32/src/main.cpp'),/MASTER_PINS\[8\]/);
 assert.match(c,/TRAINEX_AS5600_NEUTRAL_RAW -1/);
 assert.match(c,/TRAINEX_ENABLE_BUZZER_DRIVER 0/);
});

test('all 13 handle detents are valid physical master inputs',()=>{
 assert.equal(MASTER_HANDLE_POSITIONS.length,13);
 for(const notch of MASTER_HANDLE_POSITIONS){
  assert.equal(validateHardwareInput({deviceId:'esp32',sequence:0,controlId:'MASTER_HANDLE',value:notch}).valid,true,notch);
 }
 assert.equal(validateHardwareInput({deviceId:'esp32',sequence:0,controlId:'MASTER_HANDLE',value:'B8'}).valid,false);
});

test('vigilance, horn press/release, EB release and side enables map through input manager',async()=>{
 let commands=[];
 const manager=createInputManager({getSessionId:()=> 'sess1', dispatchCommand: c=>{commands.push(c);return {accepted:true}}});
 const run=async (sequence,controlId,value)=>manager.submit({source:'hardware',deviceId:'esp32',sequence,controlId,value});
 for(const [i,id,value] of [[1,'VIGILANCE_ACKNOWLEDGE',true],[2,'EMERGENCY_BRAKE_RELEASE',true],[3,'DOOR_ENABLE_LEFT',true],[4,'DOOR_ENABLE_RIGHT',true],[5,'DOORS_OPEN',true],[6,'DOORS_CLOSE',true],[7,'HORN',true],[8,'HORN',false]]){
  assert.equal((await run(i,id,value)).accepted,true,id);
 }
 assert.deepEqual(commands.map(x=>[x.type,x.value]),[
 ['VIGILANCE_ACKNOWLEDGE',null],['EMERGENCY_BRAKE_RELEASE',null],
 ['DOOR_ENABLE_SET','LEFT'],['DOOR_ENABLE_SET','RIGHT'],
 ['DOOR_OPEN_REQUEST',null],['DOOR_CLOSE_REQUEST',null],
 ['HORN_SET',true],['HORN_SET',false],
 ]);
 assert.equal((await run(9,'DOORS_OPEN',false)).accepted,false); // press-only buttons
 assert.equal((await run(10,'VIGILANCE_ACKNOWLEDGE',undefined)).accepted,false);
});

test('relay validates new controls and rejects release-edge for non-horn',()=>{
 const msg=(controlId,value)=>({type:'input',deviceId:'esp32',sessionId:'active-session',sequence:3,controlId,value});
 assert.equal(validateDeviceInput(msg('VIGILANCE_ACKNOWLEDGE',true),'esp32').valid,true);
 assert.equal(validateDeviceInput(msg('HORN',false),'esp32').valid,true);
 assert.equal(validateDeviceInput(msg('DOOR_ENABLE_LEFT',true),'esp32').valid,true);
 assert.equal(validateDeviceInput(msg('EMERGENCY_BRAKE_RELEASE',false),'esp32').valid,false);
 assert.equal(validateDeviceInput(msg('EMERGENCY_BRAKE_RESET',true),'esp32').valid,false);
});

test('engine tracks horn momentary state and preserves 3-second EB release',()=>{
 const e=new TrainSimulationEngine();e.startSession();
 assert.equal(e.sendCommand({type:'HORN_SET',value:true}).accepted,true);
 assert.equal(e.getState().hornActive,true);
 assert.equal(e.sendCommand({type:'HORN_SET',value:false}).accepted,true);
 assert.equal(e.getState().hornActive,false);
 assert.equal(e.sendCommand({type:'MASTER_HANDLE_SET',value:'EB'}).accepted,true);
 assert.equal(e.sendCommand({type:'MASTER_HANDLE_SET',value:'N'}).accepted,true);
 assert.equal(e.sendCommand({type:'EMERGENCY_BRAKE_RELEASE'}).accepted,true);
 e.step(3.1);assert.equal(e.getState().emergencyBrake,false);
});

test('feedback emits vigilance buzzer flag and no visual output GPIO is assigned',()=>{
 const feedback=makeHardwareFeedback({speed:0,vigilanceWarning:true,vigilanceBuzzer:true,vigilanceTrip:false,hornActive:false});
 assert.equal(feedback.vigilanceBuzzer,true);
 assert.equal(feedback.vigilanceTrip,false);
 assert.doesNotMatch(read('hardware/esp32/include/TrainexHardwareConfig.h'),/PIN_LED/);
});
