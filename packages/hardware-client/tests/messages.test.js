import test from 'node:test';import assert from 'node:assert/strict';
import {parseHardwareMessage} from '../src/messages/parseHardwareMessage.js';
import {validateInboundHardwareMessage} from '../src/messages/hardwareMessageValidator.js';
test('rejects malformed input payloads',()=>{assert.equal(parseHardwareMessage('{').ok,false);assert.equal(validateInboundHardwareMessage({type:'input',deviceId:'d',sessionId:'s',sequence:-1,controlId:'MASTER_HANDLE',value:'P1'},{sessionId:'s'}).valid,false)});
