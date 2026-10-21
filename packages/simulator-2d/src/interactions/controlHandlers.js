
import {
  HANDLE_POSITIONS,
} from "../config/consoleLayout.js";

export function createControlHandlers(
  sendInput,
  sessionId
) {
  function dispatch(type, value = null) {
    if (typeof sendInput !== "function") {
      throw new Error(
        "Centralized Input Management is unavailable."
      );
    }

    return sendInput({
      type,
      value,
      source: "2d",
      sessionId,
    });
  }

  return {
    setMasterHandle(position) {
      if (!HANDLE_POSITIONS.includes(position)) {
        throw new Error("Unsupported handle position.");
      }

      return dispatch(
        "MASTER_HANDLE_SET",
        position
      );
    },

    activateEmergencyBrake() {
      return dispatch(
        "EMERGENCY_BRAKE_ACTIVATE"
      );
    },

    resetEmergencyBrake() {
      return dispatch(
        "EMERGENCY_BRAKE_RESET"
      );
    },

    openDoors() {
      return dispatch(
        "DOOR_OPEN_REQUEST"
      );
    },

    closeDoors() {
      return dispatch(
        "DOOR_CLOSE_REQUEST"
      );
    },
  };
}
