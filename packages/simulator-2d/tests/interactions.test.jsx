
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createControlHandlers,
} from "../src/interactions/controlHandlers.js";

import {
  handleMasterKeyDown,
} from "../src/interactions/keyboardHandlers.js";

describe("TRAINEX command interactions", () => {
  it("generates a door-open request", () => {
    const sendInput = vi.fn();

    const controls = createControlHandlers(
      sendInput,
      "SESSION_01"
    );

    controls.openDoors();

    expect(sendInput).toHaveBeenCalledWith({
      type: "DOOR_OPEN_REQUEST",
      value: null,
      source: "2d",
      sessionId: "SESSION_01",
    });
  });

  it("generates an explicit emergency reset request", () => {
    const sendInput = vi.fn();

    createControlHandlers(
      sendInput,
      "SESSION_01"
    ).resetEmergencyBrake();

    expect(sendInput).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "EMERGENCY_BRAKE_RESET",
      })
    );
  });

  it("moves the master selection using arrow keys", () => {
    const request = vi.fn();

    const event = {
      key: "ArrowRight",
      preventDefault: vi.fn(),
    };

    handleMasterKeyDown(
      event,
      "N",
      request
    );

    expect(request).toHaveBeenCalledWith(
      "P3"
    );

    expect(
      event.preventDefault
    ).toHaveBeenCalled();
  });
});
