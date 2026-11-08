import test from 'node:test';import assert from 'node:assert/strict';
import {validateCommand} from '../src/commands/commandSchema.js';
const c=(type,value)=>({type,value,source:'2d',sessionId:'SESSION'});
test('13 positions and door side validation',()=>{
 for(const d of ['EB','B7','B6','B5','B4','B3','B2','B1','N','P1','P2','P3','P4']) assert.equal(validateCommand(c('MASTER_HANDLE_SET',d)).valid,true);
 assert.equal(validateCommand(c('DOOR_ENABLE_SET','LEFT')).valid,true);
 assert.equal(validateCommand(c('DOOR_ENABLE_SET','RIGHT')).valid,true);
 assert.equal(validateCommand(c('DOOR_ENABLE_SET','UP')).valid,false);
 assert.equal(validateCommand(c('EMERGENCY_BRAKE_RELEASE',null)).valid,true);
 assert.equal(validateCommand(c('EMERGENCY_BRAKE_RESET',null)).valid,false);
 assert.equal(validateCommand(c('VIGILANCE_ACKNOWLEDGE',null)).valid,false);
});
