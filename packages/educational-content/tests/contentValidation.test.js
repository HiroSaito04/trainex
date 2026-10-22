import test from 'node:test';
import assert from 'node:assert/strict';
import {listComponents,listLessons,listGuides,listGlossaryEntries,getLesson} from '../src/index.js';

const components=listComponents();const lessons=listLessons();const guides=listGuides();const glossary=listGlossaryEntries();
const componentIds=new Set(components.map(x=>x.id));const lessonIds=new Set(lessons.map(x=>x.id));
const unique=(items,key)=>assert.equal(new Set(items.map(x=>x[key])).size,items.length,`Duplicate ${key}`);

test('all data groups have required items and unique identifiers',()=>{
 assert.equal(components.length,5);assert.equal(lessons.length,9);assert.equal(guides.length,4);assert.ok(glossary.length>=25);
 unique(components,'id');unique(components,'slug');unique(lessons,'id');unique(guides,'id');unique(glossary,'slug');
});
test('all lessons contain sections, objectives, and valid review answers',()=>{
 for(const lesson of lessons){
  assert.ok(lesson.title&&lesson.summary);assert.ok(lesson.objectives.length>0);assert.ok(lesson.sections.length>=2);
  assert.ok(lesson.reviewQuestions.length>=2);
  for(const question of lesson.reviewQuestions){
   assert.ok(question.question);assert.ok(question.explanation);
   assert.ok(question.answerIndex>=0 && question.answerIndex<question.choices.length);
  }
  for(const id of lesson.componentIds)assert.ok(componentIds.has(id),`Unknown component ${id}`);
 }
});
test('component lesson links and guide links resolve',()=>{
 for(const component of components){
  for(const id of component.relatedLessonIds)assert.ok(lessonIds.has(id),id);
 }
 for(const guide of guides){
  assert.ok(guide.steps.length>=3);
  for(const id of guide.relatedLessonIds)assert.ok(getLesson(id));
 }
});
test('glossary entries are structured and refer only to known components',()=>{
 for(const item of glossary){
  assert.ok(item.term&&item.definition&&item.category&&item.slug);
  for(const id of item.relatedComponentIds)assert.ok(componentIds.has(id),id);
 }
});

test('lessons teach driver-cab concepts rather than platform architecture',()=>{
 const software=/Simulation Engine|Centralized Input Manager|TRAINEX is a browser|2D console|3D cabin|Node\.js|WebSocket/i;
 for(const lesson of lessons){
  const material=[lesson.title,lesson.summary,...lesson.objectives,...lesson.sections.flatMap(s=>[s.heading,s.body,...(s.points??[])]),...lesson.reviewQuestions.flatMap(q=>[q.question,q.explanation])].join(' ');
  assert.equal(software.test(material),false,`Software tutorial content in ${lesson.id}`);
 }
 assert.ok(lessons.some(l=>l.title.includes('Master Control')));
 assert.ok(lessons.some(l=>l.title.includes('Service Braking')));
 assert.ok(lessons.some(l=>l.title.includes('Driver Display')));
});
