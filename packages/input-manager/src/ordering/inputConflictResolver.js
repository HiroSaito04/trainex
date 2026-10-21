// The engine alone resolves operating conflicts (doors/traction/emergency).
// Here we only enforce that the command targets the active session.
export function validateActiveSession(command, getSessionId) {
  const activeId = getSessionId?.();
  if (!activeId) return { valid: false, reason: 'Start a simulation session first.' };
  if (command.sessionId !== activeId)
    return { valid: false, reason: 'Input targets a different session.' };
  return { valid: true };
}
