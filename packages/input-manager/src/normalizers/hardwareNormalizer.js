import { validateHardwareInput } from '@trainex/contracts';
import { mapControlToCommand } from '../mappings/controlMappings.js';
export function normalizeHardware(event) {
  const validation = validateHardwareInput(event);
  if (!validation.valid) return { error: validation.reason };
  const mapped = mapControlToCommand(event.controlId, event.value);
  if (!mapped) return { error: 'Unknown hardware control.' };
  return {
    ...mapped, source: 'hardware', sessionId: event.sessionId,
    deviceId: event.deviceId, sequence: event.sequence,
  };
}
