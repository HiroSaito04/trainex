import test from 'node:test';import assert from 'node:assert/strict';
import {InputSequenceTracker} from '../src/synchronization/InputSequenceTracker.js';
import {HardwareStateSynchronizer} from '../src/synchronization/HardwareStateSynchronizer.js';
test('sequence tracking blocks replays',()=>{const q=new InputSequenceTracker();assert.equal(q.commit('a',1),true);assert.equal(q.commit('a',1),false);assert.equal(q.commit('a',2),true)});
test('publishes only state changes',()=>{const sent=[];let speed=0;const h=new HardwareStateSynchronizer({send:x=>sent.push(x),getState:()=>({speed,emergencyBrake:false,allDoorsClosed:true})});assert.equal(h.push(),true);assert.equal(h.push(),false);speed=10;assert.equal(h.push(),true);assert.equal(sent.length,2)});
