import { mapControlToCommand } from '../mappings/controlMappings.js';
export function normalizePointer(event) {
  const mapped = mapControlToCommand(event.controlId, event.value);
  if (!mapped) return null;
  return { ...mapped, source: '2d', sessionId: event.sessionId };
}
