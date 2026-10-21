import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCommand } from '../src/index.js';
const good = { type:'MASTER_HANDLE_SET',value:'N',source:'2d',sessionId:'demo' };
test('validates a 2D neutral master command',()=>assert.equal(validateCommand(good).valid,true));
test('rejects an unrecognized handle value',()=>assert.equal(validateCommand({...good,value:'FULL_POWER'}).valid,false));
test('requires an active session id',()=>assert.equal(validateCommand({...good,sessionId:''}).valid,false));
test('rejects a door command with a value',()=>assert.equal(validateCommand({...good,type:'DOOR_OPEN_REQUEST',value:'BAD'}).valid,false));
