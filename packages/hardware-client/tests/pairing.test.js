import test from 'node:test';import assert from 'node:assert/strict';
import {PairingClient} from '../src/pairing/PairingClient.js';
test('pairing requires live session and secret code',()=>{const arr=[];const c=new PairingClient({send:x=>arr.push(x)});assert.throws(()=>c.pair({deviceId:'d',sessionId:'s'}));c.pair({deviceId:'d',sessionId:'s',pairingCode:'pin'});assert.deepEqual(arr[0],{type:'pair',deviceId:'d',sessionId:'s',pairingCode:'pin'})});
