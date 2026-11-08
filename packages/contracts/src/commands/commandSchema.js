import { COMMAND_TYPES, VALID_COMMAND_TYPES } from './commandTypes.js';
import { MASTER_HANDLE_POSITIONS, DOOR_SIDES, COMMAND_SOURCES } from './commandValues.js';

// Reject malformed commands *before* they reach the simulation engine.
export function validateCommand(command) {
  const reject = reason => ({ valid: false, reason });
  if (!command || typeof command !== 'object' || Array.isArray(command))
    return reject('Command must be an object.');
  if (!VALID_COMMAND_TYPES.includes(command.type))
    return reject('Unsupported command type.');
  if (!COMMAND_SOURCES.includes(command.source))
    return reject('Unsupported input source.');
  if (typeof command.sessionId !== 'string' || !command.sessionId.trim())
    return reject('A valid active sessionId is required.');
  if (command.type === COMMAND_TYPES.MASTER_HANDLE_SET) {
    if (!MASTER_HANDLE_POSITIONS.includes(command.value))
      return reject('Invalid master handle position.');
  } else if (command.type === COMMAND_TYPES.HORN_SET) {
    if(typeof command.value!=='boolean')return reject('Horn command requires a boolean value.');
  } else if (command.type === COMMAND_TYPES.DOOR_ENABLE_SET || command.type === COMMAND_TYPES.DOOR_OPEN_REQUEST || command.type === COMMAND_TYPES.DOOR_CLOSE_REQUEST) {
    if (command.type === COMMAND_TYPES.DOOR_ENABLE_SET && !['LEFT','RIGHT'].includes(command.value)) return reject('Choose LEFT or RIGHT to enable doors.');
    if (command.type !== COMMAND_TYPES.DOOR_ENABLE_SET && command.value != null && !DOOR_SIDES.includes(command.value)) return reject('Invalid door side.');
  } else if (command.value != null)
    return reject('This command does not accept a value.');
  return { valid: true };
}
