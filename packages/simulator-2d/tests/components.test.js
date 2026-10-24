import test from 'node:test';
import assert from 'node:assert/strict';
import {CAB_PARTS,CAB_VIEWBOX,DISPLAY_DETENTS,MASTER_POSITIONS,PART_BY_ID} from '../src/config/consoleParts.js';
import {partBounds,shapeContains,masterDetentFromY,getSvgPoint,CAB_ZOOM_LEVELS} from '../src/core/cabGeometry.js';

test('all control selectors use the exact SVG viewBox',()=>{
  assert.deepEqual(CAB_VIEWBOX,{x:0,y:0,width:1540,height:798});
  const ids=new Set();
  for(const part of CAB_PARTS){
    assert.ok(!ids.has(part.id),`Duplicate ${part.id}`);ids.add(part.id);
    const b=partBounds(part.shape);
    assert.ok(b.x>=0&&b.y>=0&&b.w>0&&b.h>0,part.id);
    assert.ok(b.x+b.w<=CAB_VIEWBOX.width&&b.y+b.h<=CAB_VIEWBOX.height,part.id);
    assert.equal(PART_BY_ID[part.id],part);
  }
  assert.ok(CAB_PARTS.length>=40);
});
test('button shapes match the reference artwork coordinates',()=>{
  assert.equal(shapeContains(PART_BY_ID.brakeCylinder.shape,619,107),true);
  assert.equal(shapeContains(PART_BY_ID.brakePipe.shape,695,107),true);
  assert.equal(shapeContains(PART_BY_ID.speedometer.shape,780,107),true);
  assert.equal(shapeContains(PART_BY_ID.masterHandle.shape,675,375),true);
  assert.equal(shapeContains(PART_BY_ID.leftDoorOpen.shape,394,404),true);
  assert.equal(shapeContains(PART_BY_ID.rightDoorClose.shape,1153,408),true);
  assert.equal(shapeContains(PART_BY_ID.trainRadio.shape,510,205),true);
  assert.equal(shapeContains(PART_BY_ID.trainRadio.shape,800,200),false);
});
test('exact eight master handle positions are calibrated in vertical SVG units',()=>{
  assert.deepEqual(MASTER_POSITIONS,['EB','B3','B2','B1','N','P1','P2','P3']);
  assert.deepEqual(DISPLAY_DETENTS,['P3','P2','P1','N','B1','B2','B3','EB']);
  assert.equal(masterDetentFromY(330),'P3');
  assert.equal(masterDetentFromY(373),'N');
  assert.equal(masterDetentFromY(431),'EB');
});
test('SVG coordinate mapping includes centering (viewBox letterboxing)',()=>{
  const fake={getScreenCTM(){return null;},getBoundingClientRect(){return {left:20,top:40,width:770,height:500};}};
  const point=getSvgPoint(20+385,40+(500-399)/2+199.5,fake);
  assert.ok(Math.abs(point.x-770)<.0001);
  assert.ok(Math.abs(point.y-399)<.0001);
  assert.equal(CAB_ZOOM_LEVELS[0],1);
});
test('interactive shapes dispatch only supported engine controls',()=>{
  const supported=new Set(['MASTER_HANDLE_SET','EMERGENCY_BRAKE_ACTIVATE','DOOR_OPEN_REQUEST','DOOR_CLOSE_REQUEST']);
  for(const part of CAB_PARTS){if(part.command)assert.ok(supported.has(part.command),part.id);}
  assert.equal(PART_BY_ID.radio.command,null);
  assert.equal(PART_BY_ID.reverser.command,null);
  assert.equal(PART_BY_ID.horn.command,null);
});
