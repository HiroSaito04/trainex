export function advancePassengerDoors(state, deltaSeconds, config) {
  if (state.doorState === 'OPENING') {
    const progress = Math.min(1, state.doorProgress + deltaSeconds / config.openingSeconds);
    return {
      ...state,
      doorProgress: progress,
      doorState: progress >= 1 ? 'OPEN' : 'OPENING',
    };
  }
  if (state.doorState === 'CLOSING') {
    const progress = Math.max(0, state.doorProgress - deltaSeconds / config.closingSeconds);
    return {
      ...state,
      doorProgress: progress,
      doorState: progress <= 0 ? 'CLOSED' : 'CLOSING',
    };
  }
  return state;
}
