import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const svg=new URL('../src/assets/TRAINEX-Driver-Cab-2D.svg',import.meta.url);
const publicSvg=new URL('../../../apps/web/public/models/2d/trainex-driver-cab.svg',import.meta.url);
// SHA256 of the user's most recently uploaded file (not an earlier 2D SVG).
const sha='058f03288af4d633863045b508ed93f49c022ca5f17e03871bd32222a3232d36';
test('latest artist-supplied SVG is byte-for-byte unchanged',()=>{
 const original=readFileSync(svg);
 assert.equal(createHash('sha256').update(original).digest('hex'),sha);
 assert.match(original.toString('utf8'),/viewBox="0 0 1540 798"/);
});
test('web import copy is byte-for-byte identical to the original SVG',()=>{
 assert.deepEqual(readFileSync(publicSvg),readFileSync(svg));
});
test('overlay animates existing instruments without duplicating cabinet geometry',()=>{
 const src=readFileSync(new URL('../src/components/CabLiveOverlay.jsx',import.meta.url),'utf8');
 assert.ok(src.includes('function Needle'));
 assert.ok(src.includes('function MasterLever'));
 assert.ok(src.includes('function TcmsValues'));
 assert.ok(!src.includes('CabShell'));
 const viewer=readFileSync(new URL('../src/components/CabViewer.jsx',import.meta.url),'utf8');
 assert.match(viewer,/TRAINEX-Driver-Cab-2D\.svg\?url/);
 assert.match(viewer,/<CabLiveOverlay/);
 assert.match(viewer,/toggleExpanded/);
});
