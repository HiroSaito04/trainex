import test from 'node:test';import assert from 'node:assert/strict';
import {CAB_VIEWBOX,DISPLAY_DETENTS,PART_BY_ID} from '../src/config/consoleParts.js';
import {createCabCommand} from '../src/core/cabCommands.js';
test('new SVG viewbox matches interactive coordinates',()=>{
 assert.deepEqual(CAB_VIEWBOX,{x:0,y:0,width:1400,height:672});
 assert.equal(DISPLAY_DETENTS.length,13);assert.ok(PART_BY_ID.leftDoorEnable);
 assert.ok(PART_BY_ID.rightDoorEnable);assert.equal(PART_BY_ID.vigilance.command,null);
});
test('door control commands retain side',()=>{
 assert.equal(createCabCommand('DOOR_ENABLE_SET',{value:'LEFT',sessionId:'X'}).value,'LEFT');
 assert.equal(createCabCommand('DOOR_OPEN_REQUEST',{value:'RIGHT',sessionId:'X'}).value,'RIGHT');
 assert.throws(()=>createCabCommand('VIGILANCE_ACKNOWLEDGE',{sessionId:'X'}));
});
