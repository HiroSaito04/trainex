import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRelayConfig} from '../src/config/relayConfig.js';
import {PairingManager} from '../src/pairing/PairingManager.js';
import {DeviceRegistry} from '../src/routing/DeviceRegistry.js';
import {SessionRegistry} from '../src/routing/SessionRegistry.js';
function sock(){return {readyState:1,sent:[],send(m){this.sent.push(JSON.parse(m))}};}
test('prototype configuration needs explicit enable and random credentials',()=>{
 const env={RELAY_ALLOWED_ORIGINS:'https://trainex-six.vercel.app',RELAY_DEVICES_JSON:JSON.stringify({d:{token:'T'.repeat(40),pairingCode:'P'.repeat(24)}})};
 assert.throws(()=>loadRelayConfig(env),/RELAY_BROWSER_TOKENS/);
 const config=loadRelayConfig({...env,RELAY_ALLOW_PAIR_CODE_BROWSER_AUTH:'true'});
 assert.equal(config.allowPairCodeBrowserAuth,true);
 assert.equal(config.port,8787);
});
test('website can pair with code without a device ID',()=>{
 const devices=new DeviceRegistry(),sessions=new SessionRegistry(),browser=sock(),device=sock();
 devices.add('trainex-esp32-01',device);
 const pm=new PairingManager({devices:{'trainex-esp32-01':{token:'x',pairingCode:'unique-super-long-pair-code'}},deviceRegistry:devices,sessionRegistry:sessions});
 const res=pm.pair(browser,{sessionId:'test_session',pairingCode:'unique-super-long-pair-code'});
 assert.equal(res.ok,true);
 assert.equal(browser.sent[0].type,'paired');
 assert.equal(device.sent[0].sessionId,'test_session');
});
