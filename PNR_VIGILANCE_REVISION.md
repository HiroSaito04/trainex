> **Legacy reference only.** GPIO and EB RESET instructions here have been superseded by `TRAINEX_HARDWARE_REVISION_2026-11-08.md`.

> **HISTORICAL / SUPERSEDED:** This document describes the previous vigilance and EB Reset implementation. Do NOT follow it for the 2026-11-08 TRAINEX revision. Refer to `TRAINEX_REVISION_2026-11-08.md` instead.

# TRAINEX — PNR-reference vigilance revision

Reference: user-provided excerpt from **PNR Train Sets – Technical Specifications**, CDRL vigilance/dead-man device.

## Timings (simulation elapsed time while train speed >= 10 km/h)

| Time since qualifying driver activity | Result |
| --- | --- |
| 0 to <30 s | Monitored, no warning |
| 30 to <32.5 s | 2D/3D visual vigilance indicator ON |
| 32.5 to <35 s | Visual indicator stays ON; hardware buzzer ON via state feedback |
| >=35 s | Propulsion inhibited; penalty emergency brake latched; buzzer stage ends |

The vigilance timer restarts when the driver presses Vigilance Acknowledge or moves the master control handle to a **different detent**. Repeated commands selecting the same detent and rejected inputs do not qualify. Other real cab activity (e.g. a future horn input) can be explicitly added once implemented and validated.

The monitor starts at **at least 10 km/h**; lower speeds clear the pending untripped countdown, but do not cancel an already applied penalty. An emergency trip remains latched: explicitly acknowledge the vigilance control, stop the train, return the handle to N, and press EB Reset. Master Handle EB continues to trigger emergency braking.

Simulation time pauses when the training session is paused. A large step that crosses multiple thresholds emits all threshold events. This implementation matches the provided timing reference, but is **not** a UIC 641 compliance certification, and any exact definition of qualifying activity must be confirmed by a railway specialist.

## Hardware (no physical LEDs)

GPIO23 Vigilance button, GPIO25 EB Reset, GPIO26 Door Open, GPIO27 Door Close, GPIO13/14/16/17/18/19/21/22 master handle, and GPIO32 passive piezo buzzer (with appropriate output circuitry).

The ESP32 **does not independently time vigilance**. The simulation engine sends `state_feedback.vigilanceBuzzer` when paired and receiving browser feedback. Note: the current published website hardware connection still needs its pairing/authentication integration corrected before an ESP32 can reliably receive this feedback.

## Key revised files

- `packages/simulation-engine/src/config/vigilanceConfiguration.js`
- `packages/simulation-engine/src/systems/vigilanceSystem.js`
- `packages/simulation-engine/src/core/{TrainSimulationEngine.js,commandProcessor.js}`
- `packages/contracts/src/{state/trainStateSchema.js,hardware/feedbackSchema.js}`
- `packages/simulator-2d/` and `packages/simulator-3d/` UI indicators and readouts
- `hardware/esp32/firmware/TrainexConsole/src/outputs/BuzzerController.{h,cpp}`
- `hardware/esp32/firmware/TrainexConsole/TrainexConsole.ino`
- `hardware/esp32/circuit/wiring/vigilancePnrWiring.md`

