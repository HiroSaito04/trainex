import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const file=p=>readFileSync(path.join(project,p));
const original='models/blender/cabin/Trainex-Driver Cabin Model 01.glb';

test('the supplied .blend and backup are restored and browser GLBs are exact byte copies',()=>{
 for(const name of ['Trainex-Driver Cabin Model 01.blend','Trainex-Driver Cabin Model 01.blend1']){
  const bytes=file(`models/blender/cabin/${name}`);
  assert.ok(bytes.length>1000,'authored Blender source not empty');
  // This Blender version saves compressed .blend files using Zstandard magic.
  const uncompressed=bytes.toString('ascii',0,7)==='BLENDER';
  const zstd=bytes.readUInt32LE(0)===0xFD2FB528;
  assert.ok(uncompressed||zstd,`unrecognized Blender source compression: ${name}`);
 }
 const bytes=file(original);
 assert.equal(bytes.equals(file('models/exports/cabin/trainex_cabin.glb')),true);
 assert.equal(bytes.equals(file('apps/web/public/models/cabin/trainex_cabin.glb')),true);
});

test('GLB has original cabin node names and embedded images, not generated replacement geometry',()=>{
 const bytes=file(original);
 assert.equal(bytes.toString('ascii',0,4),'glTF');
 const length=bytes.readUInt32LE(12);
 const gltf=JSON.parse(bytes.toString('utf8',20,20+length));
 const allNodes=gltf.nodes.map(n=>n.name??'');
 const required=['INTERACTIVE_Master_Controller_Shaft','INTERACTIVE_EmergencyBrake_Cap','INTERACTIVE_LeftDoor_Open_Cap','INTERACTIVE_LeftDoor_Close_Cap','INTERACTIVE_RightDoor_Open_Cap','INTERACTIVE_RightDoor_Close_Cap'];
 for(const name of required)assert.ok(allNodes.some(node=>node===name),`missing: ${name}`);
 for(const name of ['03_Instruments_Displays__SPEED_Dial','03_Instruments_Displays__BC_Dial','03_Instruments_Displays__BP_Dial']){
  assert.ok(allNodes.some(n=>n.startsWith(name)),`missing gauge: ${name}`);
 }
 assert.ok(gltf.meshes.length>=350);
 assert.ok(gltf.images.length>0,'authored textures are embedded');
});
