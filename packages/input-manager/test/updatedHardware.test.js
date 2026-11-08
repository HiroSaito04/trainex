import test from 'node:test';import assert from 'node:assert/strict';
import {mapControlToCommand} from '../src/mappings/controlMappings.js';
test('hardware release and all handle values normalize',()=>{
 assert.deepEqual(mapControlToCommand('EMERGENCY_BRAKE_RELEASE',null),{type:'EMERGENCY_BRAKE_RELEASE',value:null});
 assert.deepEqual(mapControlToCommand('MASTER_HANDLE','B7'),{type:'MASTER_HANDLE_SET',value:'B7'});
 assert.equal(mapControlToCommand('VIGILANCE_ACKNOWLEDGE',null),null);
});
