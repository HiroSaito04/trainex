export const selectSpeed = (state) => state.speed;
export const selectMasterHandle = (state) => state.masterHandle;
export const selectDoorState = (state) => state.doorState;
export const selectAllDoorsClosed = (state) => state.allDoorsClosed;
export const selectEmergencyBrake = (state) => state.emergencyBrake;
export const selectVigilanceWarning = (state) => state.vigilanceWarning;
export const selectVigilanceBuzzer = (state) => state.vigilanceBuzzer;
export const selectVigilanceTrip = (state) => state.vigilanceTrip;

export function selectDisplayState(state) {
  return Object.freeze({
    speed: state.speed,
    masterHandle: state.masterHandle,
    doorState: state.doorState,
    allDoorsClosed: state.allDoorsClosed,
    emergencyBrake: state.emergencyBrake,
    vigilanceWarning: state.vigilanceWarning,
    vigilanceBuzzer: state.vigilanceBuzzer,
    vigilanceTrip: state.vigilanceTrip,
    vigilanceElapsedSeconds: state.vigilanceElapsedSeconds,
  });
}
