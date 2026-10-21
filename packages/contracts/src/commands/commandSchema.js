import { COMMAND_TYPES, VALID_COMMAND_TYPES } from './commandTypes.js';
import { MASTER_HANDLE_POSITIONS, COMMAND_SOURCES } from './commandValues.js';

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
  } else if (command.value != null)
    return reject('This command does not accept a value.');
  return { valid: true };
}
