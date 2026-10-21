import { DOOR_STATES, MASTER_HANDLE_POSITIONS } from '../commands/commandValues.js';
export function validateTrainState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state))
    return { valid: false, reason: 'Train state must be an object.' };
  if (!Number.isFinite(state.speed) || state.speed < 0)
    return { valid: false, reason: 'Invalid speed.' };
  if (!MASTER_HANDLE_POSITIONS.includes(state.masterHandle))
    return { valid: false, reason: 'Invalid master handle.' };
  if (!DOOR_STATES.includes(state.doorState))
    return { valid: false, reason: 'Invalid door state.' };
  if (typeof state.allDoorsClosed !== 'boolean' || state.allDoorsClosed !== (state.doorState === 'CLOSED'))
    return { valid: false, reason: 'Door indication disagrees with modeled doors.' };
  if (typeof state.emergencyBrake !== 'boolean')
    return { valid: false, reason: 'Invalid emergency brake state.' };
  return { valid: true };
}
