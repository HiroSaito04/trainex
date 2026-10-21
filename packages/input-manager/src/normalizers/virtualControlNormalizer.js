export function normalizeVirtualControl(event) {
  return {
    type: event.type,
    value: event.value ?? null,
    source: event.source,
    sessionId: event.sessionId,
  };
}
