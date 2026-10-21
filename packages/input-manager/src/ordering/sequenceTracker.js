export function createSequenceTracker() {
  const seen = new Map();
  return {
    check(command) {
      if (command.source !== 'hardware') return { valid: true };
      const key = `${command.sessionId}::${command.deviceId}`;
      const last = seen.get(key);
      if (last !== undefined && command.sequence <= last)
        return { valid: false, reason: 'Duplicate or stale hardware input.' };
      return { valid: true };
    },
    commit(command) {
      if (command.source === 'hardware')
        seen.set(`${command.sessionId}::${command.deviceId}`, command.sequence);
    },
    reset() { seen.clear(); },
  };
}
