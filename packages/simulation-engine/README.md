# @trainex/simulation-engine

Authoritative browser-compatible TRAINEX train simulation engine, independent of the React/3D interfaces and ESP32 transport. All inputs go through the centralized input manager.

## Quick example

```js
import { createEngine } from '@trainex/simulation-engine';
const engine = createEngine({autoTick:false});
const session = engine.startSession();
engine.sendCommand({type:'MASTER_HANDLE_SET',value:'P1',sessionId:session.sessionId});
engine.step(1);
console.log(engine.getState());
engine.destroy();
```

## Command types

- `MASTER_HANDLE_SET`, one of EB, B1–B7, N, P1–P4.
- `EMERGENCY_BRAKE_ACTIVATE`, from the separate Security Brake control.
- `EMERGENCY_BRAKE_RELEASE`, accepted at standstill with N selected; takes 3 seconds to clear.
- `VIGILANCE_ACKNOWLEDGE` resets the vigilance warning/timer; it never acts as an EB release.
- `DOOR_ENABLE_SET`, value `LEFT` or `RIGHT`.
- `DOOR_OPEN_REQUEST` / `DOOR_CLOSE_REQUEST`, value `LEFT`, `RIGHT`, or omitted (enabled side/default bank).

Vigilance is active for the latest named-SVG-layer revision; the engine owns the 30 s visual / 32.5 s audible / 35 s penalty sequence at speeds >= 10 km/h.

## Rules and limits

Traction requires all passenger doors secured and emergency brake inactive. Door enable/open requires standstill and N. The door banks are simulated independently, with ALL DOORS CLOSED true only when both are closed. Kinematic targets are supplied by TRAINEX's 2026 train specification. Brake-pressure gauge readings are illustrative approximations rather than verified NSCR pressure calibrations. High-speed acceleration above 30 km/h is provisional.

Use `node --test tests/revision2026.spec.mjs` from the repository root. Historical tests may still describe the previous architecture; see TRAINEX_REVISION_2026-11-08.md.

Educational simulation only; not safety-rated railway software.
