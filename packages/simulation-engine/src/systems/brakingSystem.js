// Service braking grades are illustrative, not measured brake-cylinder pressures.
const BRAKE_FACTORS = Object.freeze({ B1: 1/3, B2: 2/3, B3: 1 });
export function serviceBrakeAcceleration(state, dynamics) {
  const factor = BRAKE_FACTORS[state.masterHandle];
  if (factor == null || state.speed <= 0) return 0;
  return -dynamics.serviceBrakeDecelerationMps2 * factor;
}
