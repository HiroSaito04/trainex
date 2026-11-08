import test from 'node:test';
import assert from 'node:assert/strict';
import {TrainSimulationEngine} from '../packages/simulation-engine/src/core/TrainSimulationEngine.js';
import {MASTER_HANDLE_POSITIONS,validateCommand,validateTrainState} from '../packages/contracts/src/index.js';
import {getCabDisplayState} from '../packages/simulator-2d/src/core/trainDisplayState.js';
import {CAB_VIEWBOX,DISPLAY_DETENTS} from '../packages/simulator-2d/src/config/consoleParts.js';
const send=(e,type,value=null)=>e.sendCommand({type,value});
test('13 master handle detents and current 2D SVG',()=>{
 assert.equal(MASTER_HANDLE_POSITIONS.length,13);assert.equal(DISPLAY_DETENTS[0],'P4');assert.equal(DISPLAY_DETENTS.at(-1),'EB');
 assert.equal(CAB_VIEWBOX.width,1800);assert.equal(validateCommand({type:'MASTER_HANDLE_SET',value:'B7',source:'2d',sessionId:'T'}).valid,true);
});
test('left and right banks are independent and need enable before open',()=>{
 const e=new TrainSimulationEngine();e.startSession();assert.equal(send(e,'DOOR_OPEN_REQUEST','LEFT').accepted,false);
 assert.equal(send(e,'DOOR_ENABLE_SET','LEFT').accepted,true);assert.equal(send(e,'DOOR_OPEN_REQUEST','LEFT').accepted,true);e.step(3);
 assert.equal(e.getState().leftDoorState,'OPEN');assert.equal(e.getState().rightDoorState,'CLOSED');assert.equal(e.getState().allDoorsClosed,false);
 assert.equal(send(e,'MASTER_HANDLE_SET','P4').accepted,false);send(e,'DOOR_CLOSE_REQUEST','LEFT');e.step(3);
 assert.equal(e.getState().allDoorsClosed,true);assert.equal(e.getState().leftDoorEnabled,false);assert.equal(validateTrainState(e.getState()).valid,true);
 e.destroy();
});
test('release is NOT reset; requires stop and neutral, 3 seconds to clear',()=>{
 const e=new TrainSimulationEngine();e.startSession();send(e,'MASTER_HANDLE_SET','EB');
 assert.equal(e.getState().emergencyBrake,true);assert.equal(send(e,'EMERGENCY_BRAKE_RELEASE').accepted,false);
 send(e,'MASTER_HANDLE_SET','N');assert.equal(send(e,'EMERGENCY_BRAKE_RELEASE').accepted,true);
 e.step(2.9);assert.equal(e.getState().emergencyBrake,true);e.step(.2);
 assert.equal(e.getState().emergencyBrake,false);assert.equal(e.getState().emergencyBrakeReleasing,false);
 assert.equal(send(e,'VIGILANCE_ACKNOWLEDGE').accepted,true);e.destroy();
});
test('vigilance acknowledgement works and warning/trip originate in the engine',()=>{
 const e=new TrainSimulationEngine();e.startSession();send(e,'MASTER_HANDLE_SET','P4');e.step(35);
 assert.equal(e.getState().vigilanceWarning,true);
 assert.equal(e.getState().vigilanceTrip,false);
 assert.equal(send(e,'VIGILANCE_ACKNOWLEDGE').accepted,true);
 assert.equal(e.getState().vigilanceWarning,false);
 assert.equal(e.getState().vigilanceElapsedSeconds,0);
 e.step(36);
 assert.equal(e.getState().vigilanceTrip,true);
 assert.equal(e.getState().emergencyBrake,true);
 assert.equal(send(e,'VIGILANCE_ACKNOWLEDGE').accepted,true);
 assert.equal(e.getState().vigilanceTrip,false);
 assert.equal(e.getState().emergencyBrake,true); // Acknowledge never acts as EB release.
 e.destroy();
});
test('display derives per-side doors without inventing indications',()=>{
 const e=new TrainSimulationEngine();e.startSession();send(e,'DOOR_ENABLE_SET','RIGHT');send(e,'DOOR_OPEN_REQUEST','RIGHT');e.step(3);
 const d=getCabDisplayState(e.getState());assert.equal(d.rightDoorState,'OPEN');assert.equal(d.leftDoorState,'CLOSED');assert.equal(d.allDoorsClosed,false);e.destroy();
});

test('brake gauges respond gradually to commands and release',()=>{
 const e=new TrainSimulationEngine();e.startSession();
 assert.equal(e.getState().brakeCylinderPressureKpa,0);
 assert.equal(e.getState().brakePipePressureKpa,500);
 send(e,'MASTER_HANDLE_SET','B7');e.step(.75);
 const midway=e.getState();
 assert.ok(midway.brakeCylinderPressureKpa>0 && midway.brakeCylinderPressureKpa<350);
 e.step(.8);assert.ok(Math.abs(e.getState().brakeCylinderPressureKpa-350)<.1);
 send(e,'MASTER_HANDLE_SET','N');e.step(2.1);
 assert.ok(e.getState().brakeCylinderPressureKpa<.1);
 e.destroy();
});
