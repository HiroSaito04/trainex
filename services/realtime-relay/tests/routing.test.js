import test from 'node:test';import assert from 'node:assert/strict';
import {SessionRegistry} from '../src/routing/SessionRegistry.js';
import {MessageRouter} from '../src/routing/MessageRouter.js';
function sock(){return {readyState:1,sent:[],send(m){this.sent.push(JSON.parse(m))}}}
test('paired WSS routing preserves session and sequence',()=>{const sessions=new SessionRegistry(),device=sock(),browser=sock(),router=new MessageRouter({sessions});sessions.pair({deviceId:'d',sessionId:'s',deviceSocket:device,browserSocket:browser});let msg={type:'input',deviceId:'d',sessionId:'s',sequence:1,controlId:'DOORS_OPEN'};assert.equal(router.forwardDeviceInput('d',msg).ok,true);assert.equal(router.forwardDeviceInput('d',msg).ok,false);assert.equal(router.forwardDeviceInput('d',{...msg,sequence:2,sessionId:'other'}).ok,false);assert.equal(router.forwardFeedback(browser,{type:'state_feedback',sessionId:'s'}).ok,true);assert.equal(device.sent.length,1);assert.equal(browser.sent.length,1)});
