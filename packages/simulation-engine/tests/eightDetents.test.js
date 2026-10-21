import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../src/index.js';
const send=(engine, value)=>engine.sendCommand({type:'MASTER_HANDLE_SET',value});
test('8-detent model rejects legacy labels',()=>{const e=createEngine();e.startSession();assert.equal(send(e,'TRACTION').accepted,false);e.destroy();});
test('P1, P2, P3 have increasing acceleration',()=>{
 const a=['P1','P2','P3'].map(x=>{const e=createEngine();e.startSession();send(e,x);e.step(1);const v=e.getState().speed;e.destroy();return v;});
 assert(a[0]>0 && a[1]>a[0] && a[2]>a[1]);
});
test('B3 is stronger service braking than B1',()=>{
 const speeds=['B1','B3'].map(x=>{const e=createEngine();e.startSession();send(e,'P3');e.step(5);send(e,x);e.step(0.4);const v=e.getState().speed;e.destroy();return v;});
 assert(speeds[1]<speeds[0]);
});
test('EB master detent latches emergency until neutral and reset',()=>{
 const e=createEngine();e.startSession();assert.equal(send(e,'EB').accepted,true);
 assert.equal(e.getState().emergencyBrake,true);assert.equal(send(e,'P1').accepted,false);
 assert.equal(e.sendCommand({type:'EMERGENCY_BRAKE_RESET'}).accepted,false);
 assert.equal(send(e,'N').accepted,true);assert.equal(e.getState().emergencyBrake,true);
 assert.equal(e.sendCommand({type:'EMERGENCY_BRAKE_RESET'}).accepted,true);assert.equal(e.getState().emergencyBrake,false);e.destroy();
});
