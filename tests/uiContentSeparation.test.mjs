import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const base=new URL('../apps/web/src/',import.meta.url);
const get=p=>readFileSync(new URL(p,base),'utf8');

test('Learn contains lesson/component references, not the guide catalog or scenario catalog',()=>{
 const s=get('pages/LearningPage.jsx');
 assert.match(s,/listLessons/);assert.match(s,/listComponents/);
 assert.doesNotMatch(s,/listGuides|listScenarios/);
});
test('Train uses scenario data from the training package',()=>{
 const s=get('pages/TrainingPage.jsx');
 assert.match(s,/@trainex\/training-module/);assert.match(s,/listScenarios/);
 assert.match(s,/checklist, not automatic assessment|not automatic assessment|not automatic/);
});
test('How-to guides live in About/Guide and old training links still work',()=>{
 const router=get('App.jsx');
 for(const route of ['/about/guide','/about/guide/:guideId','/learn','/train','/training','/glossary','/learn/guides/:guideId']) assert.ok(router.includes(`path:'${route}'`),route);
 assert.match(get('pages/GuidesPage.jsx'),/listGuides/);
 assert.match(get('pages/GuideDetailPage.jsx'),/getGuide/);
});
test('Navigation points to separate destinations',()=>{
 const n=get('data/navigation.js');
 assert.match(n,/to:'\/learn'/);assert.match(n,/to:'\/train'/);assert.match(n,/to:'\/about\/guide'/);
});
test('Light mode uses multiple distinct surfaces with borders',()=>{
 const css=get('assets/styles/theme-refinement.css');
 assert.match(css,/--bg:\s*#e9edf2/);assert.match(css,/--surface-alt:\s*#e3e8ef/);
 assert.match(css,/--border-strong:\s*#aebccc/);
 assert.match(get('assets/styles/index.css'),/theme-refinement\.css/);
});
