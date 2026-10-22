import test from 'node:test';
import assert from 'node:assert/strict';
import { listLessons,listComponents,listGlossaryEntries,listGuides } from '../packages/educational-content/src/index.js';

const titles=listLessons().map(l=>l.title).join(' ').toLowerCase();
test('Learn contains nine driver-cab courses, not product tutorials',()=>{
 assert.equal(listLessons().length,9);
 for(const topic of ['driver cab','master control','traction','service braking','emergency braking','passenger door','driver display','railway safety'])assert.ok(titles.includes(topic),topic);
 assert.ok(listLessons().every(l=>!l.title.toLowerCase().includes('trainex')));
});
test('guides remain separate from cab lessons',()=>{
 assert.equal(listGuides().length,4);
 assert.equal(listComponents().length,5);
 assert.ok(listGlossaryEntries().length>=25);
 assert.ok(!listLessons().some(l=>/how to use|hardware connection|troubleshoot/i.test(l.title)));
});
