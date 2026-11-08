export function readIndications(state){
 return Object.freeze({speed:state.speed,masterHandle:state.masterHandle,doorState:state.doorState,
  leftDoorState:state.leftDoorState,rightDoorState:state.rightDoorState,
  leftDoorEnabled:state.leftDoorEnabled,rightDoorEnabled:state.rightDoorEnabled,
  allDoorsClosed:state.allDoorsClosed,emergencyBrake:state.emergencyBrake,
  emergencyBrakeReleasing:state.emergencyBrakeReleasing,
  vigilanceWarning:state.vigilanceWarning,vigilanceBuzzer:state.vigilanceBuzzer,vigilanceTrip:state.vigilanceTrip});
}
