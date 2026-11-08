import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MASTER_HANDLE_POSITIONS,validateCommand} from '../src/index.js';
const all=['EB','B3','B2','B1','N','P1','P2','P3'];
test('contracts accept eight master-handle detents only',()=>{
 assert.deepEqual(MASTER_HANDLE_POSITIONS,all);
 for(const value of all) assert.equal(validateCommand({type:'MASTER_HANDLE_SET',value,source:'2d',sessionId:'test'}).valid,true);
 for(const value of ['COAST','TRACTION','BRAKE']) assert.equal(validateCommand({type:'MASTER_HANDLE_SET',value,source:'2d',sessionId:'test'}).valid,false);
});
