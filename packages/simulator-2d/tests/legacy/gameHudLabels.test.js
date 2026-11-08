import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const hud=read('../src/components/CabViewer.jsx');
const artwork=read('../src/components/CabLiveOverlay.jsx');
const styles=read('../src/styles/simulator2d.css');

test('master handle selection changes yellow TEXT ONLY, with all eight printed detents',()=>{
  assert.match(artwork,/function ActiveDetentText\(/);
  assert.match(artwork,/const active=previewDetent\?\?state\.masterHandle\?\?'N'/);
  assert.match(artwork,/DISPLAY_DETENTS\.map\(\(position,i\)=>\<text/);
  assert.match(artwork,/fill=\{position===active\?'#FFD700':'#141719'\}/);
  assert.match(artwork,/<ActiveDetentText state=\{state\} previewDetent=\{previewDetent\}/);
  assert.doesNotMatch(artwork,/className="t2d-detent-active-box"/);
});

test('session toolbar uses actual vector icons for all simulator actions',()=>{
  for (const i of ['play','pause','restart','stop','expand','collapse']) assert.ok(hud.includes(`case '${i}'`),`Missing ${i} icon`);
  assert.match(hud,/onAction\(paused\?'resume':'start'\)/);
  for(const action of ['pause','reset','end'])assert.ok(hud.includes(`onAction('${action}')`),`Missing ${action} session action`);
  assert.match(hud,/role="toolbar" aria-label="In-cab session controls"/);
  assert.match(hud,/className="t2d-game-hud"/);
  assert.match(hud,/<GameHUDButton icon=\{viewport\.expanded\?'collapse':'expand'\}/);
  assert.match(styles,/\.t2d-session-indicator\.is-live \.t2d-session-led/);
  assert.match(styles,/\.t2d-session-actions\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});
