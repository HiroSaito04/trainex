import test from 'node:test';
import assert from 'node:assert/strict';
import {createInputManager} from '../src/index.js';
test('hardware vigilance press is normalized to the shared command',async()=>{
 const seen=[];const manager=createInputManager({getSessionId:()=> 'S1',dispatchCommand:command=>{seen.push(command);return {accepted:true}}});
 assert.equal((await manager.submit({source:'hardware',controlId:'VIGILANCE_ACKNOWLEDGE',deviceId:'esp32',sequence:1})).accepted,true);
 assert.equal(seen[0].type,'VIGILANCE_ACKNOWLEDGE');
});
