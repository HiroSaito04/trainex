import { selectDisplayState } from '../state/stateSelectors.js';

function freezeSnapshot(state) {
  return Object.freeze({
    ...state,
    display: selectDisplayState(state),
  });
}

export function createStateStore(initialState) {
  let snapshot = freezeSnapshot(initialState);
  const listeners = new Set();
  return {
    getState: () => snapshot,
    setState(nextState) {
      const next = freezeSnapshot(nextState);
      snapshot = next;
      for (const listener of [...listeners]) listener(next);
      return next;
    },
    subscribe(listener) {
      if (typeof listener !== 'function') throw new TypeError('Listener must be a function');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
