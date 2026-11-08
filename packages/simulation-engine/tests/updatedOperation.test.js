import test from 'node:test';
import assert from 'node:assert/strict';
import {TrainSimulationEngine} from '../src/index.js';
const fresh=()=>{const e=new TrainSimulationEngine();e.startSession();return e};
const send=(e,type,value=null)=>e.sendCommand({type,value});
test('13 detents supported from EB to P4',()=>{const e=fresh();for(const p of ['EB','B7','B6','B5','B4','B3','B2','B1','N','P1','P2','P3','P4']){
 if(p==='EB'){assert.equal(send(e,'MASTER_HANDLE_SET',p).accepted,true);assert.equal(send(e,'MASTER_HANDLE_SET','N').accepted,true);assert.equal(send(e,'EMERGENCY_BRAKE_RELEASE').accepted,true);e.step(3.1);}else assert.equal(send(e,'MASTER_HANDLE_SET',p).accepted,true,p);
 }});
test('power increments from P1 through P4',()=>{
 const speeds=[];for(const p of ['P1','P2','P3','P4']){const e=fresh();send(e,'MASTER_HANDLE_SET',p);e.step(4);speeds.push(e.getState().speed);}assert.ok(speeds.every((x,i)=>i===0||x>speeds[i-1]));
});
test('sides are enabled separately; left is top and right bottom in TMS model',()=>{
 const e=fresh();assert.equal(send(e,'DOOR_OPEN_REQUEST','LEFT').accepted,false);
 assert.equal(send(e,'DOOR_ENABLE_SET','LEFT').accepted,true);
 assert.equal(send(e,'DOOR_OPEN_REQUEST','RIGHT').accepted,false);
 assert.equal(send(e,'DOOR_OPEN_REQUEST','LEFT').accepted,true);
 e.step(4);assert.equal(e.getState().leftDoorState,'OPEN');assert.equal(e.getState().rightDoorState,'CLOSED');
 assert.equal(e.getState().allDoorsClosed,false);
 assert.equal(send(e,'MASTER_HANDLE_SET','P1').accepted,false);
 assert.equal(send(e,'DOOR_CLOSE_REQUEST','LEFT').accepted,true);e.step(4);
 assert.equal(e.getState().allDoorsClosed,true);
});
test('right doors independent, and no false all-closed indication',()=>{const e=fresh();send(e,'DOOR_ENABLE_SET','RIGHT');send(e,'DOOR_OPEN_REQUEST','RIGHT');e.step(5);assert.equal(e.getState().rightDoorState,'OPEN');assert.equal(e.getState().leftDoorState,'CLOSED');assert.equal(e.getState().display.allDoorsClosed,false);});
test('EB is latched; release requires N, standstill and 3 second interval',()=>{
 const e=fresh();send(e,'MASTER_HANDLE_SET','P4');e.step(5);send(e,'MASTER_HANDLE_SET','EB');
 assert.equal(send(e,'EMERGENCY_BRAKE_RELEASE').accepted,false);
 send(e,'MASTER_HANDLE_SET','N');assert.equal(send(e,'EMERGENCY_BRAKE_RELEASE').accepted,false);
 e.step(10);assert.equal(e.getState().speed,0);
 assert.equal(send(e,'EMERGENCY_BRAKE_RELEASE').accepted,true);
 assert.equal(send(e,'MASTER_HANDLE_SET','P4').accepted,false);e.step(3.1);
 assert.equal(send(e,'MASTER_HANDLE_SET','P4').accepted,true);
});
test('vigilance removed: no timed penalty trip after 50 sec',()=>{
 const e=fresh();send(e,'MASTER_HANDLE_SET','P2');e.step(50);const s=e.getState();assert.equal(s.emergencyBrake,false);assert.equal(s.vigilanceTrip,undefined);});
test('maximum speed is 120 km/h and acceleration remains bounded',()=>{
 const e=fresh();send(e,'MASTER_HANDLE_SET','P4');e.step(200);assert.ok(e.getState().speed<=120+1e-9);
});
