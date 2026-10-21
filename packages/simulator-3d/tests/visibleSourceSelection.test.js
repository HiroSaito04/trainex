import { test } from 'node:test';
import assert from 'node:assert/strict';
import {findSceneObjects,isInVisibleCabin,TARGET_OBJECTS} from '../src/config/objectMappings.js';

test('the hidden duplicate instrument can never be selected over the visible artist panel',()=>{
 const hiddenParent={name:'MiddlePanel.001',visible:false,parent:null};
 const old={name:'03_Instruments_Displays__SPEED_Dial.001',visible:true,parent:hiddenParent};
 const assembledParent={name:'Controls',visible:true,parent:null};
 const current={name:'03_Instruments_Displays__SPEED_Dial.002',visible:true,parent:assembledParent};
 assert.equal(isInVisibleCabin(old),false);
 assert.equal(isInVisibleCabin(current),true);
 const fakeScene={traverse(fn){fn(old);fn(current)}};
 assert.deepEqual(findSceneObjects(fakeScene,TARGET_OBJECTS.SPEED_DIAL),[current]);
});
