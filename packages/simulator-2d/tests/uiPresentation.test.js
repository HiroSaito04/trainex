import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const viewer=read('../src/components/CabViewer.jsx');
const simulator=read('../src/components/Simulator2D.jsx');
const css=read('../src/styles/simulator2d.css');

test('SVG import control, component browser, click-area toggle and zoom toolbar are absent',()=>{
 for(const old of ['Import SVG','Show click areas','Find a cab component','importSvgFile','fileRef','blobRef','customUrl','setDebug',
   't2d-view-actions','t2d-zoom','Zoom in','Zoom out','>Fit</button>']){
  assert.equal(viewer.includes(old),false,`${old} still appears in 2D viewer`);
 }
 assert.match(viewer,/bundledCabSvg/);
 assert.match(viewer,/svgUrl=DEFAULT_CAB_SVG_URL/);
});

test('both independent notices appear inside a top-right stack and component toast auto-closes',()=>{
 assert.match(viewer,/className="t2d-cab-stage"/);
 assert.match(viewer,/className="t2d-notification-stack"/);
 assert.match(viewer,/className="t2d-part-notice"/);
 assert.match(viewer,/<CabPartNotice selection=\{selection\} onDismiss=\{onDismiss\}/);
 assert.match(viewer,/<CabGuideNotice guide=\{guide\} onDismiss=\{dismissGuide\}/);
 assert.match(viewer,/setTimeout\(onDismiss,8500\)/);
 assert.match(css,/\.t2d-notification-stack\{position:absolute;z-index:15;top:12px;right:12px/);
 assert.match(css,/\.t2d-guide-notice/);
 assert.match(simulator,/onDismiss=\{onDismiss\}/);
});

test('session controls and Expand are both within simulator frame, not outside in web app',()=>{
 assert.match(viewer,/className="t2d-game-hud"/);
 for(const label of ['Start','Pause','Reset','End','SESSION'])assert.ok(viewer.includes(label));
 assert.match(viewer,/<CabSessionHUD status=\{sessionStatus\}/);
 assert.match(viewer,/viewport\.toggleExpanded\(\)/);
 assert.match(css,/\.t2d-game-hud\{/);
 const adapter=read('../../../apps/web/src/components/simulation/Trainex2DConnected.jsx');
 assert.doesNotMatch(adapter,/SessionToolbar|t2d-web-session/);
 assert.match(adapter,/sessionActions=\{sessionActions\}/);
});

test('hotspots are invisible but preserve keyboard access and original animated SVG',()=>{
 assert.match(css,/\.t2d-svg-hit,\.t2d-svg-hit:hover/);
 assert.match(css,/fill:rgba\(255,215,0,\.001\);stroke:none;stroke-width:0;outline:none/);
 assert.match(viewer,/shape=\{part.shape\}/);
 assert.match(viewer,/<CabLiveOverlay state=\{state\}/);
 assert.match(viewer,/role="button" tabIndex="0"/);
});
