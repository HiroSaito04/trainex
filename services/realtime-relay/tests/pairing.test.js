import test from 'node:test';import assert from 'node:assert/strict';
import {PairingManager} from '../src/pairing/PairingManager.js';
import {DeviceRegistry} from '../src/routing/DeviceRegistry.js';
import {SessionRegistry} from '../src/routing/SessionRegistry.js';
function sock(){return {readyState:1,sent:[],send(m){this.sent.push(JSON.parse(m))}}}
test('only correct pairing code creates session binding',()=>{const devices=new DeviceRegistry(),sessions=new SessionRegistry();const browser=sock(),device=sock();devices.add('d',device);const pm=new PairingManager({devices:{d:{token:'x',pairingCode:'987654'}},deviceRegistry:devices,sessionRegistry:sessions});assert.equal(pm.pair(browser,{deviceId:'d',sessionId:'s',pairingCode:'wrong'}).ok,false);assert.equal(pm.pair(browser,{deviceId:'d',sessionId:'s',pairingCode:'987654'}).ok,true);assert.equal(browser.sent[0].type,'paired')});
