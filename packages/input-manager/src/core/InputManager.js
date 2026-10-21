import { normalizeVirtualControl } from '../normalizers/virtualControlNormalizer.js';
import { normalizeKeyboard } from '../normalizers/keyboardNormalizer.js';
import { normalizePointer } from '../normalizers/pointerNormalizer.js';
import { normalizeHardware } from '../normalizers/hardwareNormalizer.js';
import { validateInput } from '../validation/inputValidator.js';
import { validateActiveSession } from '../ordering/inputConflictResolver.js';
import { createSequenceTracker } from '../ordering/sequenceTracker.js';
import { createInputEventQueue } from './inputEventQueue.js';
import { createCommandDispatcher } from './commandDispatcher.js';

export class InputManager {
  #getSessionId;
  #queue = createInputEventQueue();
  #sequences = createSequenceTracker();
  #dispatcher;

  constructor({ dispatchCommand, getSessionId }) {
    if (typeof getSessionId !== 'function')
      throw new TypeError('getSessionId must be a function.');
    this.#getSessionId = getSessionId;
    this.#dispatcher = createCommandDispatcher(dispatchCommand);
  }

  // All 2D/3D, keyboard, pointer and hardware input uses this single entry.
  submit(event) {
    return this.#queue.enqueue(async () => {
      if (!event || typeof event !== 'object' || Array.isArray(event))
        return { accepted: false, reason: 'Input event must be an object.' };

      let command;
      switch (event.source) {
        case '2d': case '3d': command = normalizeVirtualControl(event); break;
        case 'keyboard': command = normalizeKeyboard(event); break;
        case 'pointer': command = normalizePointer(event); break;
        case 'hardware': command = normalizeHardware(event); break;
        default: return { accepted: false, reason: 'Unsupported input source.' };
      }
      if (command?.error || !command)
        return { accepted: false, reason: command?.error ?? 'Unmapped control input.' };

      // Normalizers never invent a session ID if the event already names another.
      if (command.sessionId == null) command.sessionId = this.#getSessionId();
      const valid = validateInput(command);
      if (!valid.valid) return { accepted: false, reason: valid.reason };
      const session = validateActiveSession(command, this.#getSessionId);
      if (!session.valid) return { accepted: false, reason: session.reason };
      const sequence = this.#sequences.check(command);
      if (!sequence.valid) return { accepted: false, reason: sequence.reason };

      // Commit well-formed hardware sequence even when engine rejects operating action.
      this.#sequences.commit(command);
      // Do not pass transport-only details to the engine.
      const { type, value, source, sessionId } = command;
      return this.#dispatcher.dispatch({ type, value, source, sessionId });
    });
  }

  resetSequenceHistory() { this.#sequences.reset(); }
}
