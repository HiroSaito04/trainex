import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveComponentId } from '../src/config/objectMappings.js';
test('door lamp and front display are read-only model elements',()=>{
 const doorLamp={name:'INDICATOR_AllDoorsClosed_Lamp',userData:{},parent:null};
 const display={name:'04_TCMS_Electrical__TCMS_ScreenGraphic',userData:{},parent:null};
 assert.equal(resolveComponentId(doorLamp),'ALL_DOORS_CLOSED_LAMP');
 assert.equal(resolveComponentId(display),'FRONT_DISPLAY_PANEL');
});
