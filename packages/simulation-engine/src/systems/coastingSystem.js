export function coastingAcceleration(state, dynamics) {
  if (state.speed <= 0) return 0;
  return -dynamics.coastingResistanceMps2;
}
