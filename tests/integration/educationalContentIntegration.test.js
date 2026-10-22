import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {listLessons,listComponents,listGuides,searchGlossary} from '../../packages/educational-content/src/index.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const read=async path=>readFile(resolve(root,path),'utf8');

test('the website has new lesson, component and guide routes',async()=>{
 const app=await read('apps/web/src/App.jsx');
 for(const route of ['/learn/lessons/:lessonId','/learn/components/:componentId','/learn/guides/:guideId']){
  assert.ok(app.includes(route),`Missing route ${route}`);
 }
 for(const legacy of ['/simulators/2d','/simulators/3d','/hardware','/training','/glossary']){
  assert.ok(app.includes(legacy),`Existing route missing ${legacy}`);
 }
});
test('all educational pages import the shared package',async()=>{
 for(const page of ['LearningPage','GlossaryPage','LessonDetailPage','ComponentDetailPage','GuideDetailPage']){
  const source=await read(`apps/web/src/pages/${page}.jsx`);
  assert.ok(source.includes('@trainex/educational-content'),page);
 }
});
test('lesson/component/guide links have corresponding data',()=>{
 assert.equal(listLessons().length,4);assert.equal(listComponents().length,5);assert.equal(listGuides().length,4);
 assert.ok(searchGlossary('door').length>0);
});
