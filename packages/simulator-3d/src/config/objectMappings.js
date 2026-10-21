// Names exported by models/blender/scripts/rebuild_interior.py.
export const DETENTS = Object.freeze(['EB','B3','B2','B1','N','P1','P2','P3']);
export const COMPONENTS = Object.freeze({ MASTER:'MASTER_CONTROL_HANDLE', EMERGENCY:'EMERGENCY_BRAKE_SWITCH', DOORS:'PASSENGER_DOOR_CONTROLS', DISPLAY:'FRONT_DISPLAY_PANEL', LAMP:'ALL_DOORS_CLOSED_LAMP' });
export const COMPONENT_LABELS = Object.freeze({MASTER_CONTROL_HANDLE:'Master Control Handle',EMERGENCY_BRAKE_SWITCH:'Emergency Brake',PASSENGER_DOOR_CONTROLS:'Passenger Door Controls',FRONT_DISPLAY_PANEL:'Front Display Panel',ALL_DOORS_CLOSED_LAMP:'Door Indications'});
export const TARGET_OBJECTS = Object.freeze({
 MASTER_SHAFT:'INTERACTIVE_Master_Controller_Shaft', MASTER_GRIP:'INTERACTIVE_Master_Controller_ShaftHandhandle',
 EMERGENCY_CAP:'INTERACTIVE_EmergencyBrake_Cap', EMERGENCY_RESET:'INTERACTIVE_EmergencyBrake_Reset_Cap',
 LEFT_DOOR_OPEN:'INTERACTIVE_LeftDoor_Open_Cap',LEFT_DOOR_CLOSE:'INTERACTIVE_LeftDoor_Close_Cap',RIGHT_DOOR_OPEN:'INTERACTIVE_RightDoor_Open_Cap',RIGHT_DOOR_CLOSE:'INTERACTIVE_RightDoor_Close_Cap',
 SPEED_DIAL:'INDICATOR_Speedometer_Dial',SPEED_NEEDLE:'INDICATOR_Speedometer_Needle',SPEED_DIGITAL:'INDICATOR_Speedometer_DigitalFace',
 BRAKE_CYLINDER_DIAL:'INDICATOR_BrakeCylinder_Dial',BRAKE_CYLINDER_NEEDLE:'INDICATOR_BrakeCylinder_Needle',BRAKE_CYLINDER_DIGITAL:'INDICATOR_BrakeCylinder_DigitalFace',
 BRAKE_PIPE_DIAL:'INDICATOR_BrakePipe_Dial',BRAKE_PIPE_NEEDLE:'INDICATOR_BrakePipe_Needle',BRAKE_PIPE_DIGITAL:'INDICATOR_BrakePipe_DigitalFace',
 DOOR_LAMP_CAP:'INDICATOR_AllDoorsClosed_Lamp',DOOR_OPEN_LAMP:'INDICATOR_AllDoorsOpen_Lamp',DISPLAY_GRAPHIC:'04_TCMS_Electrical__TCMS_ScreenGraphic'
});
const actions = {
 [TARGET_OBJECTS.MASTER_SHAFT]:{kind:'select',componentId:COMPONENTS.MASTER},
 [TARGET_OBJECTS.MASTER_GRIP]:{kind:'select',componentId:COMPONENTS.MASTER},
 [TARGET_OBJECTS.EMERGENCY_CAP]:{kind:'command',componentId:COMPONENTS.EMERGENCY,type:'EMERGENCY_BRAKE_ACTIVATE'},
 [TARGET_OBJECTS.EMERGENCY_RESET]:{kind:'command',componentId:COMPONENTS.EMERGENCY,type:'EMERGENCY_BRAKE_RESET'},
 [TARGET_OBJECTS.LEFT_DOOR_OPEN]:{kind:'command',componentId:COMPONENTS.DOORS,type:'DOOR_OPEN_REQUEST'},
 [TARGET_OBJECTS.RIGHT_DOOR_OPEN]:{kind:'command',componentId:COMPONENTS.DOORS,type:'DOOR_OPEN_REQUEST'},
 [TARGET_OBJECTS.LEFT_DOOR_CLOSE]:{kind:'command',componentId:COMPONENTS.DOORS,type:'DOOR_CLOSE_REQUEST'},
 [TARGET_OBJECTS.RIGHT_DOOR_CLOSE]:{kind:'command',componentId:COMPONENTS.DOORS,type:'DOOR_CLOSE_REQUEST'},
};
for(const pos of DETENTS) actions[`INTERACTIVE_Master_Detent_${pos}`]={kind:'detent',componentId:COMPONENTS.MASTER,type:'MASTER_HANDLE_SET',value:pos};
const indicators=new Set(Object.values(TARGET_OBJECTS).filter(n=>n.startsWith('INDICATOR_') || n===TARGET_OBJECTS.DISPLAY_GRAPHIC));
// Model-specific aliases: the artist named the dial meshes SPEED_Dial, BC_Dial
// and BP_Dial, not INDICATOR_*. Mapping only the synthetic names made all
// instrument overlays silently miss the *actual* source geometry.
const SOURCE_ALIASES={
 '03_Instruments_Displays__SPEED_Dial':TARGET_OBJECTS.SPEED_DIAL,
 '03_Instruments_Displays__BC_Dial':TARGET_OBJECTS.BRAKE_CYLINDER_DIAL,
 '03_Instruments_Displays__BP_Dial':TARGET_OBJECTS.BRAKE_PIPE_DIAL,
};
function canonicalName(name) {
 const raw=String(name??'').replace(/[\r\n\t ]/g,'_').replace(/\.\d+$/,'');
 if(SOURCE_ALIASES[raw])return SOURCE_ALIASES[raw];
 if(actions[raw] || indicators.has(raw))return raw;
 for(const name of [...Object.keys(actions),...indicators]) if(raw.endsWith(`__${name}`))return name;
 if(raw.endsWith('__Status_ALL_DOORS_CLOSED_Cap'))return TARGET_OBJECTS.DOOR_LAMP_CAP;
 return raw;
}
export function resolveObjectAction(object){
 for(let node=object;node;node=node.parent){
  const explicit=node.userData?.trainex_action_type;
  if(['DOOR_OPEN_REQUEST','DOOR_CLOSE_REQUEST','EMERGENCY_BRAKE_ACTIVATE','EMERGENCY_BRAKE_RESET'].includes(explicit))return {kind:'command',type:explicit,componentId:explicit.startsWith('DOOR_')?COMPONENTS.DOORS:COMPONENTS.EMERGENCY};
  if(node.userData?.trainex_select_only==='MASTER_CONTROL_HANDLE')return actions[TARGET_OBJECTS.MASTER_SHAFT];
  const action=actions[canonicalName(node.name || node.userData?.trainex_original_name)];
  if(action)return action;
 }
 return null;
}
export function resolveComponentId(object){
 const action=resolveObjectAction(object);if(action)return action.componentId;
 for(let node=object;node;node=node.parent){
  const id=node.userData?.trainex_component_id;
  if(COMPONENT_LABELS[id])return id;
  const name=canonicalName(node.name);
  if(indicators.has(name)) return [TARGET_OBJECTS.DOOR_LAMP_CAP,TARGET_OBJECTS.DOOR_OPEN_LAMP].includes(name)?COMPONENTS.LAMP:COMPONENTS.DISPLAY;
 }
 return null;
}
/** Match only objects in visible cabin roots. The artist's GLB contains duplicate
 * hidden/archive assemblies: selecting them gave wrongly positioned gauges and
 * non-moving controls. Do not mutate or delete the archived source meshes.
 */
export function isInVisibleCabin(node){
 for(let p=node;p;p=p.parent)if(p.visible===false)return false;
 return true;
}
export function findSceneObjects(scene,target){
 const result=[];
 scene.traverse(node=>{
  if(isInVisibleCabin(node)&&canonicalName(node.name)===target)result.push(node);
 });
 return result;
}

