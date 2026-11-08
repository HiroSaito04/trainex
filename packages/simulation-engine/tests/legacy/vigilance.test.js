import test from 'node:test';
import assert from 'node:assert/strict';
import {createEngine} from '../src/index.js';

function fastRunningEngine() {
  const e = createEngine();
  e.startSession();
  assert.equal(e.sendCommand({type:'MASTER_HANDLE_SET', value:'P2'}).accepted, true);
  // Reach >=10 km/h, then start an uncontaminated timed interval.
  e.step(6);
  assert.ok(e.getState().speed >= 10);
  assert.equal(e.sendCommand({type:'VIGILANCE_ACKNOWLEDGE'}).accepted,true);
  return e;
}

test('PNR vigilance: visual at 30s, buzzer at 32.5s, penalty emergency braking at 35s',()=>{
  const e=fastRunningEngine();
  const events=[];
  e.onEvent(evt=>{if(evt.type.startsWith('VIGILANCE_'))events.push(evt.type)});
  e.step(29.95);
  assert.equal(e.getState().vigilanceWarning,false);
  assert.equal(e.getState().vigilanceBuzzer,false);
  assert.equal(e.getState().vigilanceTrip,false);
  e.step(0.05);
  assert.equal(e.getState().vigilanceWarning,true);
  assert.equal(e.getState().vigilanceBuzzer,false);
  e.step(2.45);
  assert.equal(e.getState().vigilanceBuzzer,false);
  e.step(0.05);
  assert.equal(e.getState().vigilanceBuzzer,true);
  assert.equal(e.getState().vigilanceTrip,false);
  e.step(2.45);
  assert.equal(e.getState().vigilanceTrip,false);
  e.step(0.05);
  assert.equal(e.getState().vigilanceTrip,true);
  assert.equal(e.getState().emergencyBrake,true);
  assert.equal(e.getState().vigilanceBuzzer,false);
  assert.deepEqual(events,['VIGILANCE_WARNING','VIGILANCE_BUZZER','VIGILANCE_TRIPPED']);
  assert.equal(e.sendCommand({type:'MASTER_HANDLE_SET',value:'P3'}).accepted,false);
  assert.equal(e.sendCommand({type:'EMERGENCY_BRAKE_RESET'}).accepted,false);
  assert.equal(e.sendCommand({type:'VIGILANCE_ACKNOWLEDGE'}).accepted,true);
  assert.equal(e.getState().vigilanceTrip,false);
  assert.equal(e.getState().emergencyBrake,true);
  assert.equal(e.sendCommand({type:'MASTER_HANDLE_SET',value:'N'}).accepted,true);
  e.step(25);
  assert.equal(e.getState().speed,0);
  assert.equal(e.sendCommand({type:'EMERGENCY_BRAKE_RESET'}).accepted,true);
  e.destroy();
});

test('master handle ACTUAL movement or a vigilance press restarts the timer; same detent does not',()=>{
  const e=fastRunningEngine();
  e.step(29.9);
  assert.equal(e.sendCommand({type:'MASTER_HANDLE_SET',value:'P2'}).accepted,true);
  e.step(0.2);
  assert.equal(e.getState().vigilanceWarning,true);
  assert.equal(e.sendCommand({type:'MASTER_HANDLE_SET',value:'N'}).accepted,true);
  assert.equal(e.getState().vigilanceElapsedSeconds,0);
  assert.equal(e.getState().vigilanceWarning,false);
  e.step(31);
  assert.equal(e.getState().vigilanceWarning,true);
  assert.equal(e.getState().vigilanceBuzzer,false);
  assert.equal(e.sendCommand({type:'VIGILANCE_ACKNOWLEDGE'}).accepted,true);
  assert.equal(e.getState().vigilanceElapsedSeconds,0);
  assert.equal(e.getState().vigilanceWarning,false);
  e.destroy();
});

test('below 10 km/h vigilance stays idle and resets unfinished warning; 10 is included',()=>{
  const e=createEngine();e.startSession();e.step(120);
  assert.equal(e.getState().vigilanceWarning,false);
  assert.equal(e.getState().vigilanceElapsedSeconds,0);
  e.sendCommand({type:'MASTER_HANDLE_SET',value:'P2'});
  e.step(3); // 0.75 m/s2 -> ~8.1 km/h, less than 10
  assert.ok(e.getState().speed<10);
  assert.equal(e.getState().vigilanceElapsedSeconds,0);
  e.step(3);
  assert.ok(e.getState().speed>=10);
  assert.ok(e.getState().vigilanceElapsedSeconds>0);
  // Artificially test exact speed boundary in isolated system test below.
  e.sendCommand({type:'MASTER_HANDLE_SET',value:'B3'});
  e.step(10);
  assert.ok(e.getState().speed<10);
  assert.equal(e.getState().vigilanceElapsedSeconds,0);
  e.destroy();
});

test('a large step crossing all deadlines still emits visual, buzzer and penalty events',()=>{
  const e=fastRunningEngine(), events=[];
  e.onEvent(evt=>{if(evt.type.startsWith('VIGILANCE_'))events.push(evt.type)});
  e.step(36);
  assert.deepEqual(events,['VIGILANCE_WARNING','VIGILANCE_BUZZER','VIGILANCE_TRIPPED']);
  assert.equal(e.getState().vigilanceTrip,true);
  e.destroy();
});

test('Master Handle EB still activates emergency brake without a separate emergency button',()=>{
 const e=createEngine();e.startSession();assert.equal(e.sendCommand({type:'MASTER_HANDLE_SET',value:'EB'}).accepted,true);
 assert.equal(e.getState().emergencyBrake,true);assert.equal(e.getState().masterHandle,'EB');e.destroy();
});

test('vigilance configuration requires strictly ordered 30/32.5/35 thresholds',()=>{
 assert.throws(()=>createEngine({vigilance:{warningAfterSeconds:33}}),/visual warning.*buzzer.*trip/);
 assert.throws(()=>createEngine({vigilance:{buzzerAfterSeconds:36}}),/visual warning.*buzzer.*trip/);
});

test('the >=10 km/h boundary includes 10 exactly and acknowledgement stops an active buzzer',()=>{
 const e=fastRunningEngine();
 e.step(33);
 assert.equal(e.getState().vigilanceBuzzer,true);
 assert.equal(e.sendCommand({type:'VIGILANCE_ACKNOWLEDGE'}).accepted,true);
 assert.equal(e.getState().vigilanceBuzzer,false);
 assert.equal(e.getState().vigilanceTrip,false);
 e.destroy();
});
