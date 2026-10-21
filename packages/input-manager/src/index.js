export { InputManager } from './core/InputManager.js';
export function createInputManager(options) {
  // Dynamic import is not necessary: public API reuses the same class below.
  return new InputManager(options);
}
import { InputManager } from './core/InputManager.js';
export { KEYBOARD_COMMANDS } from './normalizers/keyboardNormalizer.js';
export { CONTROL_COMMANDS } from './mappings/controlMappings.js';
