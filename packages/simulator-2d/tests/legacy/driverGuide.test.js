import test from 'node:test';
import assert from 'node:assert/strict';
import {contextualDriverGuide,driverControlWarning,guideFromRejection} from '../src/core/driverGuide.js';
const ready={ready:true};
const state={speed:0,masterHandle:'N',emergencyBrake:false,allDoorsClosed:true,doorState:'CLOSED'};

test('guide prompts session start and resume before cab operation',()=>{
 assert.match(contextualDriverGuide({state,ready:false,sessionStatus:'IDLE'}).description,/Press Start/);
 assert.match(contextualDriverGuide({state,ready:false,sessionStatus:'PAUSED'}).description,/Press Resume/);
 assert.match(contextualDriverGuide({state,ready:true,sessionStatus:'RUNNING'}).description,/P1/);
});
test('guide responds to doors open, moving, braking, and emergency brake',()=>{
 const scenario=s=>contextualDriverGuide({state:{...state,...s},ready:true,sessionStatus:'RUNNING'});
 assert.match(scenario({doorState:'OPEN',allDoorsClosed:false}).description,/Close/);
 assert.match(scenario({speed:32,masterHandle:'P2'}).title,/Traction/);
 assert.match(scenario({speed:25,masterHandle:'B1'}).description,/Passenger doors/);
 assert.match(scenario({emergencyBrake:true}).description,/standstill/);
});
test('warn when the driver tries doors during traction or while moving',()=>{
 const duringPower=driverControlWarning('DOOR_OPEN_REQUEST',{...ready,state:{...state,masterHandle:'P2'}});
 assert.equal(duringPower.key,'door-traction');
 assert.match(duringPower.description,/master handle to N/);
 const duringMotion=driverControlWarning('DOOR_OPEN_REQUEST',{...ready,state:{...state,speed:40}});
 assert.equal(duringMotion.key,'door-moving');
 assert.equal(driverControlWarning('DOOR_OPEN_REQUEST',{...ready,state}),null);
});
test('warn when driver applies traction with doors open or emergency brake set',()=>{
 assert.equal(driverControlWarning('MASTER_HANDLE_SET',{...ready,state:{...state,allDoorsClosed:false},value:'P1'}).key,'traction-doors');
 assert.equal(driverControlWarning('MASTER_HANDLE_SET',{...ready,state:{...state,emergencyBrake:true},value:'P3'}).key,'traction-eb');
 assert.equal(driverControlWarning('MASTER_HANDLE_SET',{...ready,state,value:'P1'}),null);
 assert.equal(driverControlWarning('MASTER_HANDLE_SET',{...ready,state,value:'N'}),null);
});
test('guide respects door sequencing and emergency reset conditions',()=>{
 assert.equal(driverControlWarning('DOOR_CLOSE_REQUEST',{...ready,state}).key,'door-not-open');
 assert.equal(driverControlWarning('DOOR_CLOSE_REQUEST',{...ready,state:{...state,doorState:'OPEN'}}),null);
 assert.equal(driverControlWarning('EMERGENCY_BRAKE_RESET',{...ready,state:{...state,speed:30}}).key,'reset-moving');
 assert.equal(driverControlWarning('EMERGENCY_BRAKE_RESET',{...ready,state:{...state,masterHandle:'B3'}}).key,'reset-neutral');
});
test('rejected input emits explanatory guide, accepted input does not',()=>{
 assert.match(guideFromRejection({accepted:false,reason:'Set master handle to N.'}).description,/master handle/);
 assert.equal(guideFromRejection({accepted:true}),null);
 assert.match(driverControlWarning('DOOR_OPEN_REQUEST',{state,ready:false}).description,/Press Start or Resume/);
});
