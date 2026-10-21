
export const COMPONENT_IDS = Object.freeze({
  DISPLAY: "FRONT_DISPLAY_PANEL",
  DOOR_LAMP: "ALL_DOORS_CLOSED_LAMP",
  MASTER: "MASTER_CONTROL_HANDLE",
  EMERGENCY: "EMERGENCY_BRAKE_SWITCH",
  DOORS: "PASSENGER_DOOR_CONTROLS",
});

export const HANDLE_POSITIONS = Object.freeze([
  "EB",
  "B3",
  "B2",
  "B1",
  "N",
  "P1",
  "P2",
  "P3",
]);

export const COMPONENT_INFO = Object.freeze({
  [COMPONENT_IDS.DISPLAY]: {
    title: "Front Display Panel",
    description:
      "Shows operating information received from the Train Simulation Engine.",
    instruction:
      "Observe speed, accepted master handle position, door status, and emergency indications.",
  },
  [COMPONENT_IDS.DOOR_LAMP]: {
    title: "All Doors Closed Lamp",
    description:
      "Indicates when all modeled passenger doors are confirmed closed.",
    instruction:
      "The lamp must not illuminate simply because the close button was pressed.",
  },
  [COMPONENT_IDS.MASTER]: {
    title: "Master Control Handle",
    description:
      "Requests three power steps, neutral, three service-brake steps, or emergency braking.",
    instruction:
      "Select a position and observe the accepted state on the display.",
  },
  [COMPONENT_IDS.EMERGENCY]: {
    title: "Emergency Brake Switch",
    description:
      "Requests emergency braking, overriding ordinary traction.",
    instruction:
      "Activation and reset are separate requests. Reset must satisfy engine conditions.",
  },
  [COMPONENT_IDS.DOORS]: {
    title: "Passenger Door Controls",
    description:
      "Requests passenger door opening or closing.",
    instruction:
      "Observe door transitions and the All Doors Closed indication.",
  },
});

export function getConsoleState(trainState) {
  const raw =
    trainState?.display ??
    trainState ??
    {};

  const master = String(
    raw.masterHandle ?? ""
  ).toUpperCase();

  const doorState = String(
    raw.doorState ??
    raw.doors ??
    "UNAVAILABLE"
  ).toUpperCase();

  return {
    speed:
      Number.isFinite(raw.speed)
        ? raw.speed
        : null,

    masterHandle:
      HANDLE_POSITIONS.includes(master)
        ? master
        : null,

    doorState:
      ["CLOSED", "OPEN", "OPENING", "CLOSING"]
        .includes(doorState)
        ? doorState
        : "UNAVAILABLE",

    allDoorsClosed:
      typeof raw.allDoorsClosed === "boolean"
        ? raw.allDoorsClosed
        : null,

    emergencyBrake:
      typeof raw.emergencyBrake === "boolean"
        ? raw.emergencyBrake
        : null,
  };
}
