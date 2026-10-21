// Only call from a deliberately focused simulator region; never from global text inputs.
export const KEYBOARD_COMMANDS = Object.freeze({
  '1': { type: 'MASTER_HANDLE_SET', value: 'EB' },
  '2': { type: 'MASTER_HANDLE_SET', value: 'B3' },
  '3': { type: 'MASTER_HANDLE_SET', value: 'B2' },
  '4': { type: 'MASTER_HANDLE_SET', value: 'B1' },
  '5': { type: 'MASTER_HANDLE_SET', value: 'N' },
  '6': { type: 'MASTER_HANDLE_SET', value: 'P1' },
  '7': { type: 'MASTER_HANDLE_SET', value: 'P2' },
  '8': { type: 'MASTER_HANDLE_SET', value: 'P3' },
  t: { type: 'MASTER_HANDLE_SET', value: 'P3' },
  c: { type: 'MASTER_HANDLE_SET', value: 'N' },
  b: { type: 'MASTER_HANDLE_SET', value: 'B2' },
  e: { type: 'EMERGENCY_BRAKE_ACTIVATE', value: null },
  r: { type: 'EMERGENCY_BRAKE_RESET', value: null },
  o: { type: 'DOOR_OPEN_REQUEST', value: null },
  p: { type: 'DOOR_CLOSE_REQUEST', value: null },
});
export function normalizeKeyboard(event) {
  if (typeof event.key !== 'string') return null;
  const mapping = KEYBOARD_COMMANDS[event.key.toLowerCase()];
  if (!mapping) return null;
  return { ...mapping, source: 'keyboard', sessionId: event.sessionId };
}
