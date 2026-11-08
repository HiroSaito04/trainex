import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXPECTED_DYNAMIC_LAYERS,applyCabSvgLayers,formatCabClock,CAB_HIT_LAYERS} from '../src/core/cabSvgLayers.js';
const svg=readFileSync(new URL('../src/assets/TRAINEX-Driver-Cab-2D.svg',import.meta.url),'utf8');
const idList=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const idSet=new Set(idList);
test('user SVG is unchanged: Figma layer IDs exist and are unique',()=>{
 assert.equal(idList.length,idSet.size);
 for(const id of EXPECTED_DYNAMIC_LAYERS)assert.ok(idSet.has(id),`Missing Figma layer ${id}`);
 assert.equal(idList.filter(id=>/^Open_Cab\d{2}_(left|right)_Door[1-4]$/.test(id)).length,64);
 assert.ok(idSet.has('DRIVERS_CABIN_DESK'));
});
function fakeNode(text=''){
 const span={localName:'tspan',textContent:text,getAttribute(name){return name==='y'?this.y??'1875.57':null;}};
 return {style:{},attributes:{},children:[span],querySelector:()=>span,setAttribute(k,v){this.attributes[k]=v;},textContent:text};
}
test('named SVG elements update light, detents, doors, TMS, session and time',()=>{
 const map=new Map();
 for(const id of EXPECTED_DYNAMIC_LAYERS)map.set(id,fakeNode());
 const doc={getElementById:id=>map.get(id)};
 for(const [index,name] of ['P4','P3','P2','P1','N','B1','B2','B3','B4','B5','B6','B7','EB'].entries())map.get(`TEXT_${name}`).children[0].y=String(1671.57+51*index);
 const clock=new Date('2026-11-08T03:15:14.000Z');
 const state={speed:72,masterHandle:'B3',allDoorsClosed:false,leftDoorState:'OPEN',rightDoorState:'CLOSED',emergencyBrake:true,emergencyBrakeReleasing:false,vigilanceWarning:true,brakeCylinderPressureKpa:180,brakePipePressureKpa:500};
 assert.equal(applyCabSvgLayers(doc,{state,sessionStatus:'RUNNING',sessionId:'TRAINEX-22',clock}),true);
 const by=id=>map.get(id);
 assert.equal(by('TEXT_B3').attributes.fill,'#FFDB3D');
 assert.equal(by('TEXT_N').attributes.fill,'#6B6E70');
 assert.equal(by('LEVER_MASTER-CONTROL').attributes.transform,'translate(0 153.000)');
 assert.equal(by('TEXT_km/h').children[0].textContent,'72 km/h');
 assert.equal(by('TEXT_SPEED(MAX120KM/H)').children[0].textContent,'72.0km/h');
 assert.equal(by('TEXT_TRAINEX SIMULATION SESSION ID').children[0].textContent,'TRAINEX-22');
 assert.equal(by('TEXT_DATE(CURRENT DATE)').children[0].textContent,'08/11/2026');
 assert.equal(by('TEXT_TIME(CURRENT TIME)').children[0].textContent,'11:15:14');
 assert.equal(by('All_Doors_Closed_Indicator_Lamp_Light_Up').style.display,'none');
 assert.equal(by('All_Doors_Open_Indicator_Lamp_Light_Up').style.display,'');
 assert.equal(by('VIGILANCE_INDICATOR_Lamp_Light_Up').style.display,'');
 assert.equal(by('EMERGENCY_BREAK_ON').style.display,'');
 assert.equal(by('EMERGENCY_BREAK_OFF').style.display,'none');
 assert.equal(by('EMERGENCY_BREAK_RELEASE_ON').style.display,'none');
 assert.equal(by('Open_Cab08_left_Door4').style.display,'');
 assert.equal(by('Open_Cab08_right_Door4').style.display,'none');
});
test('idle SVG has default dark lamps, closed overlays and N detent',()=>{
 const map=new Map(EXPECTED_DYNAMIC_LAYERS.map(id=>[id,fakeNode()]));
 const doc={getElementById:id=>map.get(id)};
 applyCabSvgLayers(doc,{state:{masterHandle:'N',speed:0,allDoorsClosed:true,leftDoorState:'CLOSED',rightDoorState:'CLOSED'},sessionStatus:'IDLE'});
 assert.equal(map.get('All_Doors_Closed_Indicator_Lamp_Light_Up').style.display,'none');
 assert.equal(map.get('All_Doors_Open_Indicator_Lamp_Light_Up').style.display,'none');
 assert.equal(map.get('VIGILANCE_INDICATOR_Lamp_Light_Up').style.display,'none');
 assert.equal(map.get('TEXT_N').attributes.fill,'#FFDB3D');
 assert.equal(map.get('Open_Cab01_left_Door1').style.display,'none');
 assert.equal(map.get('Open_Cab01_right_Door1').style.display,'none');
});
