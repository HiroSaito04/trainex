
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/react";

import FrontDisplayPanel from "../src/components/indicators/FrontDisplayPanel.jsx";

import AllDoorsClosedLamp from "../src/components/indicators/AllDoorsClosedLamp.jsx";

describe("TRAINEX 2D indications", () => {
  it("displays the supplied engine speed", () => {
    render(
      <FrontDisplayPanel
        state={{
          speed: 42.5,
          masterHandle: "P3",
          doorState: "CLOSED",
          emergencyBrake: false,
        }}
        onInspect={vi.fn()}
      />
    );

    expect(
      screen.getByText("42.5")
    ).toBeTruthy();
  });

  it("illuminates the lamp only for confirmed closure", () => {
    const { rerender } = render(
      <AllDoorsClosedLamp
        allDoorsClosed={false}
        onInspect={vi.fn()}
      />
    );

    expect(
      screen.getByTestId("door-lamp")
        .classList.contains("is-on")
    ).toBe(false);

    rerender(
      <AllDoorsClosedLamp
        allDoorsClosed
        onInspect={vi.fn()}
      />
    );

    expect(
      screen.getByTestId("door-lamp")
        .classList.contains("is-on")
    ).toBe(true);
  });
});
