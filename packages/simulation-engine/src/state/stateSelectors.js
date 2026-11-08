export const selectSpeed=s=>s.speed;
export const selectMasterHandle=s=>s.masterHandle;
export const selectDoorState=s=>s.doorState;
export const selectAllDoorsClosed=s=>s.allDoorsClosed;
export const selectEmergencyBrake=s=>s.emergencyBrake;
export function selectDisplayState(s){return Object.freeze({
 speed:s.speed,masterHandle:s.masterHandle,doorState:s.doorState,
 leftDoorState:s.leftDoorState,rightDoorState:s.rightDoorState,
 leftDoorEnabled:s.leftDoorEnabled,rightDoorEnabled:s.rightDoorEnabled,
 allDoorsClosed:s.allDoorsClosed,emergencyBrake:s.emergencyBrake,
 emergencyBrakeReleasing:s.emergencyBrakeReleasing,
 brakeCylinderPressureKpa:s.brakeCylinderPressureKpa??null,
 brakePipePressureKpa:s.brakePipePressureKpa??null,
});}
