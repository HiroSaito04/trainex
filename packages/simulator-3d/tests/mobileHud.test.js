import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {getHudState,SESSION_ACTIONS} from '../src/ui/sessionState.js';
const read=path=>readFileSync(fileURLToPath(new URL(path,import.meta.url)),'utf8');

test('session HUD exposes Start, Pause, Reset, End states',()=>{
 assert.equal(getHudState('IDLE').startAction,'start');
 assert.equal(getHudState('RUNNING').canPause,true);
 assert.equal(getHudState('RUNNING').canStart,false);
 assert.equal(getHudState('PAUSED').startAction,'resume');
 assert.equal(getHudState('PAUSED').startLabel,'Resume');
 assert.equal(getHudState('PAUSED').canEnd,true);
 assert.equal(getHudState('ENDED').canEnd,false);
 assert.deepEqual(SESSION_ACTIONS,['start','resume','pause','reset','end']);
});

test('all session controls are rendered inside 3D game viewer without notification components',()=>{
 const source=read('../src/components/Simulator3D.jsx');
 assert.match(source,/<div className=\{`t3d-game/);
 assert.match(source,/<CabSessionHUD/);
 assert.match(source,/sessionActions/);
 assert.match(source,/<MobileCabControls/);
 assert.doesNotMatch(source,/ComponentInfoPanel|GuideNotice|CabPartNotice|t3d-external-controls/);
});

test('camera mobile navigation uses direction presses and prevents scroll gestures on canvas',()=>{
 const camera=read('../src/interactions/FirstPersonController.js');
 const css=read('../src/styles/simulator3d.css');
 assert.match(camera,/setMoveDirection\(direction,enabled\)/);
 assert.match(camera,/touchPointers\.size>=2/);
 assert.match(camera,/lastPinchDistance/);
 assert.match(css,/canvas\{[^}]*touch-action:none/);
 assert.match(css,/@media\(pointer:coarse\)/);
});

test('interacting with an operating 3D mesh prevents camera pan on pointerdown',()=>{
 const ray=read('../src/interactions/RaycastSelector.js');
 assert.match(ray,/stopImmediatePropagation/);
 assert.match(ray,/resolveObjectAction/);
 assert.match(ray,/distance<12/);
});

test('mobile website navigation stays operable on narrow screens',()=>{
 const nav=read('../../../apps/web/src/components/common/navigation/mobile.css');
 assert.match(nav,/safe-area-inset-bottom/);
 assert.match(nav,/height:100dvh/);
 assert.match(nav,/touch-action:manipulation/);
});
