import {createMasterHandleAnimation} from '../animations/MasterHandleAnimation.js';
import {createEmergencySwitchAnimation} from '../animations/EmergencySwitchAnimation.js';
import {createDoorControlAnimation} from '../animations/DoorControlAnimation.js';
import {createIndicatorAnimation} from '../animations/IndicatorAnimation.js';
import {createInstrumentSurfaces} from './InstrumentSurfaces.js';
import {findSceneObjects,TARGET_OBJECTS} from '../config/objectMappings.js';
export function createTrainStateSynchronizer(root,cameraPosition){
 const components={
  handle:createMasterHandleAnimation(root),
  emergency:createEmergencySwitchAnimation(root),
  doors:createDoorControlAnimation(root),
  lamps:createIndicatorAnimation(root),
  instruments:createInstrumentSurfaces(root,cameraPosition),
 };
 const resets=findSceneObjects(root,TARGET_OBJECTS.EMERGENCY_RESET).filter(n=>n.isMesh);
 const original=resets.map(node=>node.position.clone());
 let preview=false,last=null;
 return {
  matched:Object.fromEntries(Object.entries(components).map(([name,p])=>[name,p.count])),
  previewMaster(p){preview=true;components.handle.setState(p)},
  endPreview(){preview=false;components.handle.setState(last?.masterHandle??'N')},
  update(state){if(!state)return;
   const data=state.display??state;
   last={...data,
    brakeCylinderPressureKpa:state.brakeCylinderPressureKpa??state.pressures?.brakeCylinderKpa??data.brakeCylinderPressureKpa,
    brakePipePressureKpa:state.brakePipePressureKpa??state.pressures?.brakePipeKpa??data.brakePipePressureKpa,
    permittedSpeedKmh:state.permittedSpeedKmh??data.permittedSpeedKmh
   };
   if(!preview)components.handle.setState(last.masterHandle);
   components.emergency.setState(last.emergencyBrake);
   components.doors.setState(last.doorState);
   components.lamps.setState(last.allDoorsClosed,last.doorState);
   components.instruments.setState(last);
   resets.forEach((n,i)=>{n.position.copy(original[i]);if(last.emergencyBrake===true)n.position.y+=.003});
  },
  dispose(){Object.values(components).forEach(c=>c.dispose());resets.forEach((n,i)=>n.position.copy(original[i]))}
 };
}
