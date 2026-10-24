import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { readdirSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const web=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=resolve(web,'src');
const read=p=>readFileSync(resolve(web,p),'utf8');

function files(root) {
 return readdirSync(root,{withFileTypes:true}).flatMap(entry=>{
  const p=resolve(root,entry.name);
  return entry.isDirectory()?files(p):[p];
 });
}

test('theme variables have a single authoritative owner',()=>{
 const tokens=read('src/assets/styles/tokens.css');
 const other=files(src).filter(f=>f.endsWith('.css')&&!f.endsWith('/tokens.css'));
 assert.match(tokens,/:root\[data-theme="dark"\]/);
 assert.match(tokens,/--border-strong/);
 for(const file of other){
  const css=readFileSync(file,'utf8');
  assert.doesNotMatch(css,/--bg\s*:/,file);
  assert.doesNotMatch(css,/--surface\s*:/,file);
 }
 assert.equal(existsSync(resolve(src,'assets/styles/theme-refinement.css')),false);
 assert.equal(existsSync(resolve(src,'assets/styles/responsive.css')),false);
});

test('navigation and footer have independent CSS owners',()=>{
 assert.match(read('src/components/common/NavBar.jsx'),/\.\/NavBar\.css/);
 assert.match(read('src/components/common/BrandWordmark.jsx'),/\.\/BrandWordmark\.css/);
 assert.match(read('src/components/common/Footer.jsx'),/\.\/Footer\.css/);
 assert.doesNotMatch(read('src/components/common/NavBar.css'),/\.footer-inner|\.trainex-footer-main/);
 assert.match(read('src/components/common/Footer.css'),/\.trainex-footer-main/);
});

test('all local JavaScript and CSS import paths are resolvable',()=>{
 for(const file of files(src).filter(p=>/\.(js|jsx)$/.test(p))){
  const text=readFileSync(file,'utf8');
  for(const [,spec] of text.matchAll(/\bfrom\s*['"](\.[^'"]+)['"]|\bimport\s*['"](\.[^'"]+)['"]/g)){
   const value=spec;
   if(!value)continue;
   const target=resolve(dirname(file),value);
   assert.ok(existsSync(target)||existsSync(target+'.js')||existsSync(target+'.jsx'),`${file}: ${value}`);
  }
 }
});

test('the app includes all major routes and direct simulator adapters',()=>{
 const app=read('src/App.jsx');
 for(const route of ['/simulators/2d','/simulators/3d','/learn','/train','/hardware','/about/guide'])assert.ok(app.includes(route),route);
 assert.match(read('src/pages/Simulator2DPage.jsx'),/Trainex2DConnected/);
 assert.match(read('src/pages/Simulator3DPage.jsx'),/Trainex3DConnected/);
 assert.doesNotMatch(read('src/main.jsx'),/registerSimulator2D|registerSimulator3D/);
});

test('public simulator assets and syncing tools are restored',()=>{
 for(const path of ['public/models/2d/trainex-driver-cab.svg','public/models/cabin/trainex_cabin.glb','tools/sync-2d-assets.mjs','tools/sync-3d-assets.mjs'])assert.ok(existsSync(resolve(web,path)),path);
 const svg=read('public/models/2d/trainex-driver-cab.svg');
 assert.match(svg,/<svg\b/i);
});

test('all CSS imports resolve, including navbar partials',()=>{
 for(const file of files(src).filter(f=>f.endsWith('.css'))){
  const css=readFileSync(file,'utf8');
  for(const [,location] of css.matchAll(/@import\s+["'](\.[^"']+)["']/g)){
   assert.ok(existsSync(resolve(dirname(file),location)),`${file} -> ${location}`);
  }
 }
});

test('styles for Home, Hardware, and both simulator pages are owned by their pages',()=>{
 for(const [component,name] of [
  ['HomePage.jsx','home.css'],['HardwarePage.jsx','hardware.css'],
  ['Simulator2DPage.jsx','simulation.css'],['Simulator3DPage.jsx','simulation.css']
 ]) assert.ok(read(`src/pages/${component}`).includes(name),component);
});
