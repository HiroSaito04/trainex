import { findSceneObjects, TARGET_OBJECTS } from '../config/objectMappings.js';
/** Visual vigilance lamp on the imported driver panel; not train authority. */
export function createVigilanceLampAnimation(scene) {
 const nodes=findSceneObjects(scene,TARGET_OBJECTS.VIGILANCE_LAMP).filter(n=>n.isMesh);
 const records=nodes.map(node=>{
  const original=node.material;
  const materials=(Array.isArray(original)?original:[original]).map(mat=>mat.clone());
  node.material=Array.isArray(original)?materials:materials[0];
  return {node,original,materials};
 });
 return {
  count:nodes.length,
  setState({vigilanceWarning=false,vigilanceTrip=false}={}){
   for(const {materials} of records)for(const mat of materials){
    if(!mat.emissive)continue;
    mat.emissive.set(vigilanceTrip?'#ff303c':vigilanceWarning?'#ffd143':'#000000');
    mat.emissiveIntensity=vigilanceTrip?1.5:vigilanceWarning?1:0;
   }
  },
  dispose(){for(const {node,original,materials} of records){node.material=original;materials.forEach(m=>m.dispose());}}
 };
}
