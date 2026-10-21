// Prototype traction grades. Final values must be calibrated to rolling stock data.
const POWER_FACTORS = Object.freeze({ P1: 1/3, P2: 2/3, P3: 1 });
export function tractionAcceleration(state, dynamics, rules) {
  const factor = POWER_FACTORS[state.masterHandle];
  if (factor == null || state.emergencyBrake) return 0;
  if (rules.requireDoorsClosedForTraction && !state.allDoorsClosed) return 0;
  return dynamics.tractionAccelerationMps2 * factor;
}
