const VALID_STATES = Object.freeze(['IDLE', 'RUNNING', 'PAUSED', 'ENDED']);
let nextSession = 1;

export class SessionManager {
  #status = 'IDLE';
  #sessionId = null;

  getStatus() { return this.#status; }
  getSessionId() { return this.#sessionId; }
  getInfo() { return Object.freeze({ status: this.#status, sessionId: this.#sessionId }); }

  start(sessionId) {
    if (this.#status === 'RUNNING' || this.#status === 'PAUSED') {
      return { ok: false, reason: 'End the current session first.' };
    }
    this.#sessionId = sessionId ?? `TRAINEX-${nextSession++}`;
    if (typeof this.#sessionId !== 'string' || !this.#sessionId.trim()) {
      this.#sessionId = null;
      return { ok: false, reason: 'sessionId must be a nonempty string.' };
    }
    this.#status = 'RUNNING';
    return { ok: true, sessionId: this.#sessionId };
  }
  pause() {
    if (this.#status !== 'RUNNING') return { ok: false, reason: 'Session is not running.' };
    this.#status = 'PAUSED';
    return { ok: true };
  }
  resume() {
    if (this.#status !== 'PAUSED') return { ok: false, reason: 'Session is not paused.' };
    this.#status = 'RUNNING';
    return { ok: true };
  }
  reset() {
    if (!['RUNNING', 'PAUSED'].includes(this.#status)) return { ok: false, reason: 'No active session.' };
    this.#status = 'PAUSED';
    return { ok: true };
  }
  end() {
    if (!['RUNNING', 'PAUSED'].includes(this.#status)) return { ok: false, reason: 'No active session.' };
    this.#status = 'ENDED';
    return { ok: true };
  }
}
export { VALID_STATES as SESSION_STATES };
