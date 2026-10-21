import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createInputManager} from '../src/index.js';
test('keyboard digits 1-8 map to all detents',async()=>{
 const values=[]; const manager=createInputManager({getSessionId:()=> 's',dispatchCommand:cmd=>{values.push(cmd.value);return {accepted:true}}});
 for(let n=1;n<=8;n++)assert.equal((await manager.submit({source:'keyboard',key:String(n)})).accepted,true);
 assert.deepEqual(values,['EB','B3','B2','B1','N','P1','P2','P3']);
});
