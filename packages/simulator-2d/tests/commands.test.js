import test from 'node:test';
import assert from 'node:assert/strict';
import {createCabCommand,dispatchCabCommand} from '../src/core/cabCommands.js';

test('commands use the central Input Manager virtual source schema',()=>{
 assert.deepEqual(createCabCommand('MASTER_HANDLE_SET',{value:'B2',sessionId:'run-1'}),{source:'2d',type:'MASTER_HANDLE_SET',value:'B2',sessionId:'run-1'});
 assert.deepEqual(createCabCommand('DOOR_OPEN_REQUEST',{sessionId:'run-1'}),{source:'2d',type:'DOOR_OPEN_REQUEST',value:null,sessionId:'run-1'});
});
test('invalid commands and detents are rejected before dispatch',()=>{
 assert.throws(()=>createCabCommand('HORN_ACTIVATE'),RangeError);
 assert.throws(()=>createCabCommand('MASTER_HANDLE_SET',{value:'P4'}),RangeError);
});
test('idle session and absent session ID cannot submit operating inputs',async()=>{
 let calls=0;
 const send=()=>{calls++;return {accepted:true};};
 assert.equal((await dispatchCabCommand(send,'DOOR_OPEN_REQUEST',{sessionId:'run-1',ready:false})).accepted,false);
 assert.equal((await dispatchCabCommand(send,'DOOR_OPEN_REQUEST',{sessionId:null,ready:true})).accepted,false);
 assert.equal(calls,0);
});
test('accepted and rejected engine responses are preserved',async()=>{
 const sent=[];
 const send=event=>{sent.push(event);return event.value==='EB'?{accepted:false,reason:'Rejected by engine.'}:{accepted:true};};
 const accepted=await dispatchCabCommand(send,'MASTER_HANDLE_SET',{value:'P2',sessionId:'active',ready:true});
 const rejected=await dispatchCabCommand(send,'MASTER_HANDLE_SET',{value:'EB',sessionId:'active',ready:true});
 assert.equal(accepted.accepted,true);assert.equal(rejected.reason,'Rejected by engine.');
 assert.equal(sent.length,2);assert.equal(sent[0].source,'2d');assert.equal(sent[1].sessionId,'active');
});
test('dispatcher exceptions become rejection feedback, not unhandled errors',async()=>{
 const response=await dispatchCabCommand(()=>{throw new Error('connection lost');},'EMERGENCY_BRAKE_ACTIVATE',{sessionId:'active',ready:true});
 assert.equal(response.accepted,false);assert.match(response.reason,/connection lost/);
});
