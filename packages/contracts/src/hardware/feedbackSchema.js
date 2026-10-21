export function makeHardwareFeedback(state) {
  return Object.freeze({
    type: 'state_feedback',
    allDoorsClosed: state.allDoorsClosed === true,
    emergencyBrake: state.emergencyBrake === true,
    speed: Number.isFinite(state.speed) ? state.speed : null,
  });
}
