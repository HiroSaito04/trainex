export const SESSION_STATUSES = Object.freeze(['IDLE', 'RUNNING', 'PAUSED', 'ENDED']);
export function validateSessionState(session) {
  if (!session || !SESSION_STATUSES.includes(session.status))
    return { valid: false, reason: 'Invalid session status.' };
  if (session.sessionId != null && (typeof session.sessionId !== 'string' || !session.sessionId.trim()))
    return { valid: false, reason: 'Invalid session ID.' };
  return { valid: true };
}
