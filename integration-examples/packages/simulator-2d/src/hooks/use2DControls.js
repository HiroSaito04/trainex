import { useCallback, useMemo, useState } from 'react';
import { createControlHandlers } from '../interactions/controlHandlers.js';

// Every control is a command request. Only a published engine snapshot
// updates the lever, display, switches and lamps.
export function use2DControls({ sendInput, sessionId, ready }) {
  const [feedback, setFeedback] = useState('');
  const handlers = useMemo(
    () => createControlHandlers(sendInput, sessionId),
    [sendInput, sessionId]
  );

  const submit = useCallback(async action => {
    if (!ready) {
      setFeedback('Start or resume the simulation session first.');
      return false;
    }
    try {
      setFeedback('');
      const result = await action();
      if (result?.accepted !== true) {
        setFeedback(result?.reason ?? 'Command rejected.');
        return false;
      }
      setFeedback('Command accepted.');
      return true;
    } catch (error) {
      setFeedback(error?.message ?? 'Command failed.');
      return false;
    }
  }, [ready]);

  return {
    feedback,
    setMasterHandle: value => submit(() => handlers.setMasterHandle(value)),
    activateEmergencyBrake: () => submit(handlers.activateEmergencyBrake),
    resetEmergencyBrake: () => submit(handlers.resetEmergencyBrake),
    openDoors: () => submit(handlers.openDoors),
    closeDoors: () => submit(handlers.closeDoors),
  };
}
