// The indication is derived from *modeled* door state, never a button press.
export function updateIndications(state) {
  return {
    ...state,
    allDoorsClosed: state.doorState === 'CLOSED',
  };
}
