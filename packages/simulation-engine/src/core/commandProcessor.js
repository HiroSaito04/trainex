const HANDLE_POSITIONS = new Set(['EB','B3','B2','B1','N','P1','P2','P3']);
const COMMANDS = new Set([
  'MASTER_HANDLE_SET', 'EMERGENCY_BRAKE_ACTIVATE', 'EMERGENCY_BRAKE_RESET',
  'DOOR_OPEN_REQUEST', 'DOOR_CLOSE_REQUEST',
]);

export function processCommand(state, command, { doors, rules }) {
  if (!command || typeof command !== 'object' || Array.isArray(command)) {
    return { accepted: false, reason: 'Command must be an object.' };
  }
  if (!COMMANDS.has(command.type)) {
    return { accepted: false, reason: 'Unsupported command type.' };
  }
  const reject = (reason) => ({ accepted: false, reason });
  let nextState = state;
  switch (command.type) {
    case 'MASTER_HANDLE_SET': {
      if (!HANDLE_POSITIONS.has(command.value)) return reject('Unsupported master handle position.');
      if (command.value.startsWith('P') && state.emergencyBrake) {
        return reject('Release emergency brake before applying traction.');
      }
      if (command.value.startsWith('P') && rules.requireDoorsClosedForTraction && !state.allDoorsClosed) {
        return reject('Cannot apply traction unless all doors are confirmed closed.');
      }
      nextState = { ...state, masterHandle: command.value, emergencyBrake: command.value === 'EB' ? true : state.emergencyBrake };
      break;
    }
    case 'EMERGENCY_BRAKE_ACTIVATE': {
      if (state.emergencyBrake) return reject('Emergency brake already active.');
      nextState = { ...state, emergencyBrake: true };
      break;
    }
    case 'EMERGENCY_BRAKE_RESET': {
      if (!state.emergencyBrake) return reject('Emergency brake is not active.');
      if (rules.requireStandstillForEmergencyReset && state.speed > doors.stoppedThresholdKmh) {
        return reject('Emergency brake reset requires a stopped train.');
      }
      if (rules.requireCoastForEmergencyReset && state.masterHandle !== 'N') {
        return reject('Set master handle to N before emergency reset.');
      }
      nextState = { ...state, emergencyBrake: false };
      break;
    }
    case 'DOOR_OPEN_REQUEST': {
      if (state.doorState !== 'CLOSED') return reject('Doors must be fully closed before opening.');
      if (rules.requireStandstillForDoorOperation && state.speed > doors.stoppedThresholdKmh) {
        return reject('Doors cannot open while the train is moving.');
      }
      if (rules.requireCoastForDoorOpening && state.masterHandle !== 'N') {
        return reject('Set master handle to N before opening doors.');
      }
      nextState = { ...state, doorState: 'OPENING', allDoorsClosed: false };
      break;
    }
    case 'DOOR_CLOSE_REQUEST': {
      if (state.doorState !== 'OPEN') return reject('Doors must be fully open before closing.');
      nextState = { ...state, doorState: 'CLOSING', allDoorsClosed: false };
      break;
    }
  }
  return { accepted: true, nextState, type: command.type };
}
