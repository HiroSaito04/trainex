import { HARDWARE_CONTROL_IDS } from './hardwareControlIds.js';
export function validateHardwareInput(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event))
    return { valid: false, reason: 'Hardware event must be an object.' };
  if (typeof event.deviceId !== 'string' || !event.deviceId.trim() || event.deviceId.length > 128)
    return { valid: false, reason: 'A deviceId is required.' };
  if (!Number.isSafeInteger(event.sequence) || event.sequence < 0)
    return { valid: false, reason: 'Invalid hardware sequence.' };
  if (!Object.values(HARDWARE_CONTROL_IDS).includes(event.controlId))
    return { valid: false, reason: 'Unsupported hardware control.' };
  return { valid: true };
}
