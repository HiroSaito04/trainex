import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CAB_PARTS,PART_BY_ID} from '../src/config/consoleParts.js';

test('all component descriptions explain purpose without inspection or implementation disclaimers',()=>{
  for(const p of CAB_PARTS){
    assert.ok(p.label?.trim() && p.description?.trim(),p.id);
    assert.doesNotMatch(p.description,/inspect(?:ion)?[- ]only|not supported|not simulated|informational|not yet supported|not (?:currently )?implemented|current engine|prototype/i,p.id);
  }
});

test('auxiliary devices show their function instead of an inspection-only message',()=>{
  assert.match(PART_BY_ID.electricButtons.description,/battery and pantograph/i);
  assert.match(PART_BY_ID.bypassSwitches.description,/bypass\/rescue/i);
  assert.match(PART_BY_ID.horn.description,/horn/i);
  assert.match(PART_BY_ID.reverser.description,/direction/i);
  assert.match(PART_BY_ID.leftDoorLock.description,/secure/i);
});

test('component toast uses the description without automatic unsupported notes',()=>{
  const viewer=readFileSync(new URL('../src/components/CabViewer.jsx',import.meta.url),'utf8');
  assert.match(viewer,/<p>\{selection\.description\}<\/p>/);
  assert.match(viewer,/onInspect\(part\.id\);/);
});
