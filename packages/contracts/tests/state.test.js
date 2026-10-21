import test from 'node:test';
import assert from 'node:assert/strict';
import {validateTrainState,readIndications} from '../src/index.js';
const state={speed:0,masterHandle:'N',doorState:'CLOSED',allDoorsClosed:true,emergencyBrake:false};
test('validates consistent train state',()=>assert.equal(validateTrainState(state).valid,true));
test('detects a false doors-closed indication',()=>assert.equal(validateTrainState({...state,doorState:'OPEN'}).valid,false));
test('indication selector reflects state',()=>assert.equal(readIndications(state).allDoorsClosed,true));
