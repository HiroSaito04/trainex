import test from 'node:test';import assert from 'node:assert/strict';
import {validateDeviceInput} from '../src/validation/relayMessageValidator.js';
import {createRateLimiter} from '../src/security/rateLimiter.js';
test('device message validation and rate limiting',()=>{const x={type:'input',deviceId:'a',sessionId:'s',sequence:1,controlId:'MASTER_HANDLE',value:'P3'};assert.equal(validateDeviceInput(x,'a').valid,true);assert.equal(validateDeviceInput({...x,value:'P99'},'a').valid,false);const r=createRateLimiter({max:2});assert.equal(r.allow('a',0),true);assert.equal(r.allow('a',1),true);assert.equal(r.allow('a',2),false)});
