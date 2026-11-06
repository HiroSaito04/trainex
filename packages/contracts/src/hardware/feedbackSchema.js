export function makeHardwareFeedback(state) {
  return Object.freeze({
    type: 'state_feedback',
    allDoorsClosed: state.allDoorsClosed === true,
    emergencyBrake: state.emergencyBrake === true,
    vigilanceWarning: state.vigilanceWarning === true,
    vigilanceBuzzer: state.vigilanceBuzzer === true,
    vigilanceTrip: state.vigilanceTrip === true,
    speed: Number.isFinite(state.speed) ? state.speed : null,
  });
}
