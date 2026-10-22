import test from 'node:test';
import assert from 'node:assert/strict';
import {listComponents,getComponent,listComponentsForLesson,listLessonsForComponent} from '../src/index.js';

test('TRAINEX has exactly its five required components',()=>{
 const items=listComponents();
 assert.equal(items.length,5);
 assert.deepEqual(new Set(items.map(x=>x.id)),new Set([
  'FRONT_DISPLAY_PANEL','ALL_DOORS_CLOSED_LAMP','MASTER_CONTROL_HANDLE','EMERGENCY_BRAKE_SWITCH','PASSENGER_DOOR_CONTROLS'
 ]));
});
test('component lookup supports both component ID and slug',()=>{
 assert.equal(getComponent('MASTER_CONTROL_HANDLE')?.title,'Master Control Handle');
 assert.equal(getComponent('master-control-handle')?.id,'MASTER_CONTROL_HANDLE');
 assert.equal(getComponent('missing'),null);
 assert.equal(getComponent(null),null);
});
test('eight master handle detents match the shared contracts',()=>{
 assert.deepEqual(getComponent('MASTER_CONTROL_HANDLE').positions.map(x=>x.value),['EB','B3','B2','B1','N','P1','P2','P3']);
});
test('component and lesson crosslinks are usable',()=>{
 assert.ok(listComponentsForLesson('driverCabin').length>0);
 assert.ok(listLessonsForComponent('MASTER_CONTROL_HANDLE').length>0);
});
