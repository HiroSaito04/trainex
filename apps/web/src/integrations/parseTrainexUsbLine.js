/**
 * Parse only TRAINEX hardware events from ESP32 USB Serial output.
 * The current PlatformIO esp32dev bench firmware prints:
 *   BUTTON DOORS_OPEN LEFT (bench)
 *   BUTTON DOOR_ENABLE_LEFT true (bench)
 * Startup messages, arbitrary serial text, and release messages are ignored.
 * Future firmware may also send one JSON {type:"input", controlId, value} per line.
 */
const PRESS_IDS = new Set([
  'DOOR_ENABLE_LEFT',
  'DOOR_ENABLE_RIGHT',
  'VIGILANCE_ACKNOWLEDGE',
]);
const SIDE_IDS = new Set(['DOORS_OPEN', 'DOORS_CLOSE']);
const DETENTS = new Set([
  'EB', 'B7', 'B6', 'B5', 'B4', 'B3', 'B2', 'B1',
  'N', 'P1', 'P2', 'P3', 'P4',
]);

function validControl(controlId, value) {
  if (PRESS_IDS.has(controlId)) return value === true;
  if (SIDE_IDS.has(controlId)) return value === 'LEFT' || value === 'RIGHT';
  if (controlId === 'MASTER_HANDLE') return DETENTS.has(value);
  return false;
}

export function parseTrainexUsbLine(raw) {
  if (typeof raw !== 'string' || raw.length > 4096) return null;
  const line = raw.replaceAll('\0', '').trim();
  if (!line) return null;

  if (line.startsWith('{')) {
    try {
      const message = JSON.parse(line);
      if (message?.type !== 'input') return null;
      const controlId = message.controlId ?? message.control;
      if (!validControl(controlId, message.value)) return null;
      // Ignore untrusted deviceId/sessionId/sequence from the USB stream;
      // the browser assigns these from the currently active simulation session.
      return {controlId, value: message.value};
    } catch {
      return null;
    }
  }

  const button = /^BUTTON\s+([A-Z_]+)\s+(true|LEFT|RIGHT)\s+\(bench\)$/.exec(line);
  if (button) {
    const [, controlId, rawValue] = button;
    const value = rawValue === 'true' ? true : rawValue;
    return validControl(controlId, value) ? {controlId, value} : null;
  }

  const master = /^MASTER_HANDLE\s+(EB|B[1-7]|N|P[1-4])\s+\(bench\)$/.exec(line);
  if (master && validControl('MASTER_HANDLE', master[1])) {
    return {controlId: 'MASTER_HANDLE', value: master[1]};
  }
  return null;
}
