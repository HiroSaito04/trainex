import test from 'node:test';
import assert from 'node:assert/strict';
import {searchGlossary,getGlossaryEntry,listGlossaryCategories} from '../src/index.js';

test('search matches multiword queries',()=>{
 assert.ok(searchGlossary('door interlock').some(item=>item.term==='Door Interlock'));
 assert.ok(searchGlossary('brake cylinder').some(item=>item.term==='Brake Cylinder'));
});
test('search supports category filters and limits',()=>{
 const terms=searchGlossary('',{category:'Braking',limit:3});
 assert.equal(terms.length,3);
 assert.ok(terms.every(x=>x.category==='Braking'));
});
test('exact term ranks ahead of partial match',()=>{
 assert.equal(searchGlossary('Emergency Brake')[0].term,'Emergency Brake');
 assert.equal(getGlossaryEntry('door-interlock').term,'Door Interlock');
});
test('unknown terms return an empty array',()=>{
 assert.deepEqual(searchGlossary('zzz-not-known'),[]);
 assert.ok(listGlossaryCategories().includes('Passenger doors'));
});
