
import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  createControlHandlers,
} from "../interactions/controlHandlers.js";

export function use2DControls({
  sendInput,
  sessionId,
  ready,
}) {
  const [feedback, setFeedback] = useState("");

  const handlers = useMemo(() => {
    return createControlHandlers(
      sendInput,
      sessionId
    );
  }, [sendInput, sessionId]);

  const submit = useCallback(
    async (action) => {
      if (!ready) {
        setFeedback(
          "Start or resume the simulation session first."
        );

        return false;
      }

      try {
        setFeedback("");

        const result = await action();

        if (result?.accepted !== true) {
          setFeedback(
            result?.reason ??
            "Command rejected by the simulation engine."
          );

          return false;
        }

        setFeedback("Command accepted.");

        return true;
      } catch (error) {
        setFeedback(
          error?.message ??
          "Unable to send control command."
        );

        return false;
      }
    },
    [ready]
  );

  return {
    feedback,

    setMasterHandle(position) {
      return submit(() =>
        handlers.setMasterHandle(position)
      );
    },

    activateEmergencyBrake() {
      return submit(() =>
        handlers.activateEmergencyBrake()
      );
    },

    resetEmergencyBrake() {
      return submit(() =>
        handlers.resetEmergencyBrake()
      );
    },

    openDoors() {
      return submit(() =>
        handlers.openDoors()
      );
    },

    closeDoors() {
      return submit(() =>
        handlers.closeDoors()
      );
    },
  };
}
