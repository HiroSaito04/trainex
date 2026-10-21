export function readIndications(state) {
  return Object.freeze({
    speed: state.speed,
    masterHandle: state.masterHandle,
    doorState: state.doorState,
    allDoorsClosed: state.allDoorsClosed,
    emergencyBrake: state.emergencyBrake,
  });
}
