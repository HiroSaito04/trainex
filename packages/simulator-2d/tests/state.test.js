import test from 'node:test';
import assert from 'node:assert/strict';
import {getCabDisplayState,displayNumber} from '../src/core/trainDisplayState.js';

test('null state leaves unprovided readings unavailable, not invented',()=>{
 const s=getCabDisplayState(null);
 assert.equal(s.speed,null); assert.equal(s.brakeCylinderPressureKpa,null);
 assert.equal(s.brakePipePressureKpa,null);assert.equal(s.allDoorsClosed,null);
 assert.equal(displayNumber(s.speed),'—');
});
test('read authoritative top-level state and optional pressures',()=>{
 const s=getCabDisplayState({speed:43.75,masterHandle:'B2',doorState:'CLOSING',allDoorsClosed:false,
 emergencyBrake:false,pressures:{brakeCylinderKpa:389,brakePipeKpa:490}});
 assert.equal(s.speed,43.75);assert.equal(s.masterHandle,'B2');assert.equal(s.brakeCylinderPressureKpa,389);
 assert.equal(s.brakePipePressureKpa,490);assert.equal(s.doorState,'CLOSING');
 assert.equal(s.allDoorsClosed,false);
});
test('read nested display snapshot when parent values absent',()=>{
 const s=getCabDisplayState({display:{speed:4.2,masterHandle:'P1',allDoorsClosed:true,doorState:'CLOSED',emergencyBrake:false}});
 assert.equal(s.speed,4.2); assert.equal(s.masterHandle,'P1');assert.equal(s.allDoorsClosed,true);
 assert.equal(s.brakeCylinderPressureKpa,null);
});
test('preserve explicitly supplied zeroes and discard nonnumeric indicators',()=>{
 const s=getCabDisplayState({speed:0,brakeCylinderPressureKpa:0,brakePipePressureKpa:0,masterHandle:'INVALID'});
 assert.equal(s.speed,0);assert.equal(s.brakeCylinderPressureKpa,0);assert.equal(s.brakePipePressureKpa,0);
 assert.equal(s.masterHandle,null);
});
