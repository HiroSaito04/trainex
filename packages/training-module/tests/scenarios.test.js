import test from 'node:test';import assert from 'node:assert/strict';
import {listScenarios,getScenario} from '../src/repositories/scenarioRepository.js';
import {validateScenario} from '@trainex/contracts';
test('all eight scenarios validate and use supported commands',()=>{const list=listScenarios();assert.equal(list.length,8);const allowed=['MASTER_HANDLE_SET','DOOR_OPEN_REQUEST','DOOR_CLOSE_REQUEST','EMERGENCY_BRAKE_ACTIVATE','EMERGENCY_BRAKE_RESET'];for(const s of list){assert.equal(validateScenario(s).valid,true);assert.ok(s.steps.length);for(const step of s.steps){assert.ok(step.instruction);if(step.expect.commandType)assert.ok(allowed.includes(step.expect.commandType))}}assert.equal(getScenario('not-real'),null)});

test('all scenario briefs teach driver actions and observations',()=>{for(const s of listScenarios()){
 assert.ok(s.learningObjective && s.learningObjective.length>25);
 assert.ok(s.operatingConditions.length >= 1);
 assert.ok(s.expectedObservations.length >= 2);
 assert.ok(s.debriefQuestions.length >= 2);
}});
