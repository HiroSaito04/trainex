export function emergencyBrakeAcceleration(state, dynamics) {
  if (!state.emergencyBrake || state.speed <= 0) return 0;
  return -dynamics.emergencyBrakeDecelerationMps2;
}
