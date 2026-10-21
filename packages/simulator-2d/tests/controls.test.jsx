
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import Simulator2D from "../src/components/Simulator2D.jsx";

// Remove rendered components after each test.
// Prevents duplicate TRACTION and emergency buttons.
afterEach(() => {
  cleanup();
});

const initialState = {
  speed: 0,
  masterHandle: "N",
  doorState: "CLOSED",
  allDoorsClosed: true,
  emergencyBrake: false,
};

describe("TRAINEX 2D controls", () => {
  it("submits a master handle command", () => {
    const sendInput = vi.fn();

    render(
      <Simulator2D
        trainState={initialState}
        ready={true}
        sessionId="TEST_01"
        sendInput={sendInput}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "P3",
      })
    );

    expect(sendInput).toHaveBeenCalledWith({
      type: "MASTER_HANDLE_SET",
      value: "P3",
      source: "2d",
      sessionId: "TEST_01",
    });
  });

  it("submits an emergency brake command", () => {
    const sendInput = vi.fn();

    render(
      <Simulator2D
        trainState={initialState}
        ready={true}
        sessionId="TEST_02"
        sendInput={sendInput}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Activate emergency brake",
      })
    );

    expect(sendInput).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "EMERGENCY_BRAKE_ACTIVATE",
        source: "2d",
        sessionId: "TEST_02",
      })
    );
  });

  it("disables operating controls without an engine", () => {
    const sendInput = vi.fn();

    render(
      <Simulator2D
        trainState={initialState}
        ready={false}
        sendInput={sendInput}
      />
    );

    const tractionButton = screen.getByRole(
      "button",
      { name: "P3" }
    );

    expect(tractionButton.disabled).toBe(true);

    fireEvent.click(tractionButton);

    expect(sendInput).not.toHaveBeenCalled();
  });
});
