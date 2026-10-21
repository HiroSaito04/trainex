# @trainex/simulation-engine

Standalone, browser-compatible, pure-JavaScript authoritative train simulation engine.
Does not depend on React, Three.js, hardware transports, or the input-manager internals.

## Usage

```js
import { createEngine } from '@trainex/simulation-engine';

const engine = createEngine({ autoTick: true });
const start = engine.startSession();
const unsubscribe = engine.subscribe((snapshot) => console.log(snapshot.display));
engine.sendCommand({ type: 'MASTER_HANDLE_SET', value: 'TRACTION', sessionId: start.sessionId });
// ...
unsubscribe();
engine.destroy();
```

Use `autoTick: false` (default) and `step(seconds)` for deterministic tests or
when a higher-level session coordinator owns the update loop.

## Command types

- `MASTER_HANDLE_SET`, value `BRAKE` | `COAST` | `TRACTION`
- `EMERGENCY_BRAKE_ACTIVATE`
- `EMERGENCY_BRAKE_RESET`
- `DOOR_OPEN_REQUEST`
- `DOOR_CLOSE_REQUEST`

`sendCommand` returns `{ accepted: boolean, reason?: string }`.
Rejected commands do not change train state. Session IDs are checked when provided.
All software and ESP32-originated commands must go through the centralized input manager
before reaching `sendCommand`.

## Operating rules (prototype)

- Traction needs all doors confirmed closed and emergency brake inactive.
- Opening doors needs the train stopped and handle in COAST.
- Emergency braking overrides all other motion states.
- Reset requires stopped train and COAST handle.
- Door transitions take configured durations.
- `allDoorsClosed` is calculated from actual modeled door state, not from a button press.
- Paused or ended sessions do not accept control commands.
- `resetSession` stops ticking, resets train data and leaves the session PAUSED.

## IMPORTANT

Acceleration/deceleration, top speed, and door timings are illustrative **prototype** values.
They have not been validated against the TRAINEX approved console/rolling-stock references.
The code is for an educational simulator, not operational railway control or safety.
