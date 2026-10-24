import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const base=resolve(import.meta.dirname,'../src');
const file=(subpath)=>readFileSync(resolve(base,subpath),'utf8');
test('imported SVG is the actual, complete artwork',()=>{
 const source=file('assets/TRAINEX-Driver-Cab-2D.svg');
 assert.match(source,/viewBox="0 0 1540 798"/);
 assert.ok(source.length>1_000_000);
});
test('selectors share the artwork SVG coordinate space; no percentage hit boxes',()=>{
 const source=file('components/CabViewer.jsx');
 assert.match(source,/viewBox="0 0 1540 798"/);
 assert.match(source,/<HitGeometry/);
 assert.match(source,/<image href=\{url\}/);
 assert.ok(!/targetToPercent/.test(source));
 assert.ok(!/style=\{targetToPercent/.test(source));
});
test('SVG is swappable through the project asset path, not a browser upload UI',()=>{
 const viewer=file('components/CabViewer.jsx');
 assert.match(viewer,/DEFAULT_CAB_SVG_URL/);
 assert.match(viewer,/bundledCabSvg/);
 assert.doesNotMatch(viewer,/Import SVG|URL\.createObjectURL|Show click areas/);
});
test('overlay does not render a duplicate cabinet or HTML button layer',()=>{
 const overlay=file('components/CabLiveOverlay.jsx');
 assert.match(overlay,/return <g className="t2d-live-overlay"/);
 assert.ok(!/<svg viewBox/.test(overlay));
 assert.ok(!/CabShell|PhysicalCab/.test(overlay));
});
