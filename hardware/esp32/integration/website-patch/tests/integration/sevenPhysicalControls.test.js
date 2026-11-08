import test from 'node:test';
import assert from 'node:assert/strict';
import {validateHardwareInput} from '@trainex/contracts';
import {createInputManager} from '@trainex/input-manager';
import {validateDeviceInput} from '../../services/realtime-relay/src/validation/relayMessageValidator.js';
const BUTTONS=[
 ['DOOR_ENABLE_LEFT',true,'DOOR_ENABLE_SET','LEFT'],
 ['DOORS_OPEN','LEFT','DOOR_OPEN_REQUEST','LEFT'],
 ['DOORS_CLOSE','LEFT','DOOR_CLOSE_REQUEST','LEFT'],
 ['DOOR_ENABLE_RIGHT',true,'DOOR_ENABLE_SET','RIGHT'],
 ['DOORS_OPEN','RIGHT','DOOR_OPEN_REQUEST','RIGHT'],
 ['DOORS_CLOSE','RIGHT','DOOR_CLOSE_REQUEST','RIGHT'],
 ['VIGILANCE_ACKNOWLEDGE',true,'VIGILANCE_ACKNOWLEDGE',null],
];
for(const [id,value,type,expected] of BUTTONS){
  test(`${id} ${String(value)} maps to ${type}`,async()=>{
    const event={source:'hardware',deviceId:'test-esp32',sessionId:'TRAINEX-1',sequence:1,controlId:id,value};
    assert.equal(validateHardwareInput(event).valid,true);
    assert.equal(validateDeviceInput({...event,type:'input'},'test-esp32').valid,true);
    let received=null;
    const mgr=createInputManager({getSessionId:()=>event.sessionId,dispatchCommand:command=>{received=command;return {accepted:true}}});
    const accepted=await mgr.submit(event);
    assert.equal(accepted.accepted,true);
    assert.equal(received.type,type);
    assert.equal(received.value,expected);
  });
}
test('rejects malformed door-side inputs',()=>{
  for(const value of ['UP','LEFT_OPEN',false,0,'',null]){
    const event={deviceId:'test-esp32',sessionId:'TRAINEX-1',sequence:1,controlId:'DOORS_OPEN',value};
    assert.equal(validateHardwareInput(event).valid,false);
    assert.equal(validateDeviceInput({...event,type:'input'},'test-esp32').valid,false);
  }
});
test('only seven designated controls and handle accepted from hardware',()=>{
  for(const id of ['HORN','EMERGENCY_BRAKE','EMERGENCY_BRAKE_RELEASE']){
    const event={deviceId:'test-esp32',sessionId:'TRAINEX-1',sequence:1,controlId:id,value:true};
    assert.equal(validateHardwareInput(event).valid,false);
    assert.equal(validateDeviceInput({...event,type:'input'},'test-esp32').valid,false);
  }
});
test('handle all 13 positions valid and invalid calibration values rejected',()=>{
  for(const value of ['EB','B7','B6','B5','B4','B3','B2','B1','N','P1','P2','P3','P4'])
    assert.equal(validateHardwareInput({deviceId:'test-esp32',sequence:2,controlId:'MASTER_HANDLE',value}).valid,true);
  assert.equal(validateHardwareInput({deviceId:'test-esp32',sequence:3,controlId:'MASTER_HANDLE',value:'P5'}).valid,false);
});
