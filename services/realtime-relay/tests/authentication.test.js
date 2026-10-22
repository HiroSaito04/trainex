import test from 'node:test';import assert from 'node:assert/strict';
import {authenticateDevice} from '../src/authentication/deviceAuthentication.js';
import {authenticateBrowser} from '../src/authentication/sessionAuthentication.js';
import {isAllowedBrowserOrigin} from '../src/security/originPolicy.js';
const creds={trainex:{token:'A'.repeat(32),pairingCode:'123456'}};
test('role credentials and origins must match',()=>{assert.ok(authenticateDevice('trainex','A'.repeat(32),creds));assert.equal(authenticateDevice('trainex','wrong',creds),false);assert.ok(authenticateBrowser('t'.repeat(32),['t'.repeat(32)]));assert.ok(isAllowedBrowserOrigin('https://example.com',['https://example.com']));assert.equal(isAllowedBrowserOrigin('https://evil.com',['https://example.com']),false)});
