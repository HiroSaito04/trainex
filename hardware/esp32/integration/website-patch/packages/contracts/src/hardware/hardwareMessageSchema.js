import { HARDWARE_CONTROL_IDS } from './hardwareControlIds.js';
const DOOR_SIDES = new Set(['LEFT','RIGHT']);
const ACTIVE_PHYSICAL_IDS = new Set(['MASTER_HANDLE','DOOR_ENABLE_LEFT','DOOR_ENABLE_RIGHT','DOORS_OPEN','DOORS_CLOSE','VIGILANCE_ACKNOWLEDGE']);
const DETENTS = new Set(['EB','B7','B6','B5','B4','B3','B2','B1','N','P1','P2','P3','P4']);
export function validateHardwareInput(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event))
    return { valid: false, reason: 'Hardware event must be an object.' };
  if (typeof event.deviceId !== 'string' || !event.deviceId.trim() || event.deviceId.length > 128)
    return { valid: false, reason: 'A deviceId is required.' };
  if (!Number.isSafeInteger(event.sequence) || event.sequence < 0)
    return { valid: false, reason: 'Invalid hardware sequence.' };
  if (!ACTIVE_PHYSICAL_IDS.has(event.controlId))
    return { valid: false, reason: 'Unsupported hardware control.' };
  if (event.controlId === HARDWARE_CONTROL_IDS.MASTER_HANDLE) {
    if (!DETENTS.has(event.value)) return { valid: false, reason: 'Invalid physical detent.' };
  } else if (event.controlId === HARDWARE_CONTROL_IDS.DOORS_OPEN ||
             event.controlId === HARDWARE_CONTROL_IDS.DOORS_CLOSE) {
    if (!DOOR_SIDES.has(event.value))
      return { valid: false, reason: 'Door event requires LEFT or RIGHT.' };
  } else if (event.value !== true) {
    return { valid: false, reason: 'Momentary commands are press-only.' };
  }
  return { valid: true };
}
