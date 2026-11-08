import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CAB_PARTS,PART_BY_ID} from '../src/config/consoleParts.js';
import {CAB_HIT_LAYERS,CAB_HIT_LAYER_FALLBACKS,findCabLayerBounds} from '../src/core/cabSvgLayers.js';
const read=path=>readFileSync(new URL(path,import.meta.url));
const svg=read('../src/assets/TRAINEX-Driver-Cab-2D.svg');
const idSet=new Set([...svg.toString().matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));

const specified={
  bypassATP:'ATP BYPASS SWITCH_DESIGN',bypassZS:'SPEEDMETER/ZERO SPEED BYPASS SWITCH_DESIGN',
  bypassADC:'ALL DOORS CLOSED BYPASS SWITCH_DESIGN',bypassTCMS:'TCMS BYPASS SWITCH_DESIGN',
  bypassDSD:'DRIVER SAFETY DEVICE BYPASS SWITCH_DESIGN',bypassMR:'MAIN RESERVOIR PRESSURE BYPASS SWITCH_DESIGN',
  bypass:'BYPASS_SWITCHES_BOARD_DESIGN',securityBrake:'SECURITY_BRAKE_BUTTON_DESIGN',
  driverKey:'DRIVER_KEYHOLE_DESIGN',reverser:'REVERSER_CONTROL_DESIGN',
  horn:'HORN_BUTTON_DESIGN',modeSelector:'MODE_SELECTOR_KNOB_DESIGN',cabSelector:'CAB_SELECTION_KNOB_DESIGN',
  pantograph:'PANTOGRAPH_BUTTON_DESIGN',batteryOff:'BATTERY_OFF_BUTTON_DESIGN',batteryOn:'BATTERY_ON_BUTTON_DESIGN',
  electricBrake:'ELECTRIC_BRAKE_SWITCH_BUTTON',parkingBrake:'PARKING_BRAKE_SWITCH_BUTTON',
  tailLight:'TAIL_LIGHT_SWITCH_BUTTON',headLight:'HEAD_LIGHT_SWITCH_BUTTON',
  brakeCylinder:'BRAKE_CYLINDER_PRESSURE_GAUGE_DESIGN',brakePipe:'BRAKE_PIPE_PRESSURE_GAUGE_DESIGN',
  voltage:'TRACTION_VOLTAGE _METER_DESIGN',current:'TRACTION_CURRENT_METER_DESIGN',
  remoteIndicatorsBoard:'INDICATORS_DESIGN',stationStop:'STATION_STOP_INDICATOR',
  departureAuthorize:'DEPART_AUTHORIZED_INDICATOR',remoteBrake:'REMOTE_EB_INDICATOR',
  radio:'TRAIN_PROTECTION_RADIO_BOARD_DESIGN',radioPower:'POWER_PUSH_BUTTON_SWITCH_DESIGN',
  radioEmergency:'EMERGENCY_RADIO_PUSH_BUTTON_SWITCH_DESIGN',radioTest:'RADIO_TEST_PUSH_BUTTON_SWITCH_DESIGN',
  radioOCC:'OCC_CALL_PUSH_BUTTON_SWITCH_DESIGN',radioWayside:'WAYSIDE_COMMUNICATION_PUSH_BUTTON_SWITCH_DESIGN',
  radioInterrupt:'COMMUNICATION_INTERRUPTPUSH_BUTTON_SWITCH_DESIGN',radioStatus:'RADIO_STATUS_DISPLAY_DESIGN',
};
test('all requested Figma component click IDs are mapped to their own descriptions',()=>{
  for(const [part,id] of Object.entries(specified)){
    assert.equal(CAB_HIT_LAYERS[part],id,part);
    assert.ok(PART_BY_ID[part]?.description?.length>30,`Missing ${part} description`);
    assert.ok(idSet.has(id)||idSet.has(CAB_HIT_LAYER_FALLBACKS[part]),`No SVG target for ${part}: ${id}`);
  }
  assert.ok(CAB_PARTS.length>=60);
});
test('bypass target fallback uses existing exact groups but honors newer DESIGN IDs',()=>{
  for(const [part,fallback] of Object.entries(CAB_HIT_LAYER_FALLBACKS)){
    assert.ok(!idSet.has(CAB_HIT_LAYERS[part]),`bundled SVG already includes ${CAB_HIT_LAYERS[part]}`);
    assert.ok(idSet.has(fallback),`missing fallback ${fallback}`);
  }
  const fakeElement={getBBox:()=>({x:100,y:200,width:50,height:60})};
  const named={getElementById:id=>id==='ATP BYPASS SWITCH'?fakeElement:null};
  assert.deepEqual(findCabLayerBounds(named).bypassATP,{kind:'rect',x:100*1800/8784,y:200*1800/8784,w:50*1800/8784,h:60*1800/8784,rx:2});
});
test('component descriptions identify function without inventing operating commands',()=>{
  for(const p of CAB_PARTS){
    assert.ok(p.description.length>=35,p.id);
    assert.doesNotMatch(p.description,/inspect(?:ion)?[- ]only|not supported|not simulated|not yet supported|not (?:currently )?implemented|current engine|prototype/i,p.id);
  }
  for(const p of CAB_PARTS.filter(p=>p.id.startsWith('bypass'))){assert.equal(p.command,null,p.id);}
  assert.equal(PART_BY_ID.securityBrake.command,'EMERGENCY_BRAKE_ACTIVATE');
});
test('component descriptions live below cab except in fullscreen where they float',()=>{
  const viewer=read('../src/components/CabViewer.jsx').toString();
  const css=read('../src/styles/simulator2d.css').toString();
  assert.match(viewer,/!viewport\.expanded&&showNotices&&<div className="t2d-notification-stack t2d-info-below"/);
  assert.match(viewer,/viewport\.expanded&&showNotices&&<div className="t2d-notification-stack t2d-notification-floating"/);
  assert.match(viewer,/aria-pressed=\{guideEnabled\}/);
  assert.match(viewer,/aria-pressed=\{explanationsEnabled\}/);
  assert.match(viewer,/orderedParts\.map\(part=>/);
  assert.match(css,/\.t2d-info-below\{position:relative/);
  assert.match(css,/\.t2d-notification-floating\{position:absolute/);
});
test('original Figma SVG remains byte-for-byte the same in the web and 2D packages',()=>{
  const web=read('../../../apps/web/public/models/2d/trainex-driver-cab.svg');
  assert.deepEqual(svg,web);
  assert.equal(createHash('sha256').update(svg).digest('hex'),'f4c051a8b3c3867b06264f2a87639249324396d0b97afc1d191e72e970b755ab');
});
