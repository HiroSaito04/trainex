export function createCommandDispatcher(dispatchCommand) {
  if (typeof dispatchCommand !== 'function')
    throw new TypeError('dispatchCommand must be a function.');
  return {
    async dispatch(command) {
      try {
        const result = await dispatchCommand(command);
        if (!result || typeof result.accepted !== 'boolean')
          return { accepted: false, reason: 'Engine returned an invalid command result.' };
        return result;
      } catch (error) {
        return { accepted: false, reason: error?.message ?? 'Command dispatch failed.' };
      }
    },
  };
}
