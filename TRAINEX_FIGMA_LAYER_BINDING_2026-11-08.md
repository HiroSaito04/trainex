# TRAINEX — Figma SVG named-layer integration

**Current 2D simulator integration.** Supersedes the older 2026-11-08 notes where they describe nonfunctional SVG layers or disabled vigilance. All Figma artwork geometry and layer IDs remain unchanged.

## Source artwork

The uploaded `DRIVERS_CABIN_DESK.svg` was copied **byte-for-byte** to:

- `apps/web/public/models/2d/trainex-driver-cab.svg`
- `packages/simulator-2d/src/assets/TRAINEX-Driver-Cab-2D.svg`

SHA-256: `f4c051a8b3c3867b06264f2a87639249324396d0b97afc1d191e72e970b755ab`.

The 2D viewer uses a same-origin SVG `<object>` below transparent, accessible hit regions. It queries each existing Figma `id` through `contentDocument.getElementById`, without editing the exported SVG. It switches only display visibility/text/color/transform **at runtime**. Keep the artwork at the same origin, and do not set a `Content-Security-Policy` that blocks `object-src 'self'` without revising the layer-loading method.

## Named layer bindings

| SVG ID / family | Live behavior |
|---|---|
| `LEVER_MASTER-CONTROL` | Translates to the selected P4–EB detent; drag or use notch labels to select. |
| `MASTER_HANDLE_TEXTS > TEXT_P4…TEXT_EB` | Exactly one active notch is yellow `#FFDB3D`, default `TEXT_N`; all others gray. |
| `SPEEDOMETER_ARROW` | Rotates 0–120 km/h around the original dial pivot. |
| `TEXT_km/h` | Actual simulated speed, integer km/h. |
| `RIGHT_DOOR_*_BUTTON_DESIGN`, `LEFT_DOOR_*_BUTTON_DESIGN` | Hit regions for ENABLE / OPEN / CLOSE, independent banks with safety interlocks. |
| `Open_Cab01…Cab08_left_Door1…Door4` | **Upper** TMS row; shown while left bank is OPEN/OPENING/CLOSING, hidden if closed. |
| `Open_Cab01…Cab08_right_Door1…Door4` | **Lower** TMS row; right bank. |
| `All_Doors_Closed_Indicator_Lamp_Light_Up` | Visible only if both banks are closed and a session is active. |
| `All_Doors_Open_Indicator_Lamp_Light_Up` | Visible if a door bank is open or moving, during an active session. |
| `VIGILANCE_BUTTON_DESIGN` | Sends central `VIGILANCE_ACKNOWLEDGE`. |
| `VIGILANCE_INDICATOR_Lamp_Light_Up` | Visible on engine warning/buzzer/trip; otherwise hidden. |
| `PANEL_EB/ER > EMERGENCY_BREAK_ON/OFF` | One active/emergency-off graphic visible at a time. |
| `PANEL_EB/ER > EMERGENCY_BREAK_RELEASE_ON/OFF` | Release ON during the 3-second release process. |
| `TEXT_DATE(CURRENT DATE)` | Current date, DD/MM/YYYY, Asia/Manila. |
| `TEXT_TIME(CURRENT TIME)` | Current HH:mm:ss, Asia/Manila, refreshed every second. |
| `TEXT_TRAINEX SIMULATION SESSION ID` | Actual shared session ID, or `NO SESSION`. |
| `TEXT_SPEED(MAX120KM/H)` | Live TMS speed, one decimal km/h. |
| `BREAK_CYLINDER_ARROW`, `BRAKE_PIPE_ARROW` | Existing pressure-gauge needles turn as simulated pressures change. |

**Vigilance:** This latest user-specified 2D layer list includes a functioning vigilance acknowledge button and light, so the central engine vigilance monitor was reactivated. It follows the preexisting 30s warning, 32.5s buzzer, 35s penalty reference at 10 km/h or above. Acknowledgement clears a vigilance trip flag but **does not release an already-applied emergency brake**. The TMS Emergency Brake Release still requires standstill and N, then takes three simulated seconds. ESP32 GPIO23 is **not** rewired or reinstated by this 2D software change; hardware remains as specified in `hardware/esp32/AS5600_AND_RELEASE_SETUP.md` and needs a separate decision if a physical vigilance input is desired.

## Integration boundaries

- Reuses the existing single authoritative simulation engine, Input Manager and shared session from 2D/3D/Hardware.
- Keeps existing website navigation, 3D GLB, hardware control wiring/firmware, and styling outside the 2D display unchanged.
- Unsupported radio, breaker, mode, and auxiliary controls are still informative-only; no unsupported functions have been added.
- SVG availability/readability requires same-origin resource and SVG `<object>` support. On an incompatible browser, 2D live bindings may not work even if the SVG itself renders.
- Illustrative brake pressure values are not certified NSCR calibration values.

## Testing

From the repository root after `npm install`:

```bash
npm run test:revision
node --test packages/simulator-2d/tests/figmaSvgLayers.test.js
npm run build --workspace=./apps/web
```

At minimum verify with live browser: session Start in 2D and Hardware, master-handle lever and text, live speed and clock, left/right door bank graphics, lamp ON/OFF, vigilance acknowledgement, EB/ER states and 3-second release. The new revision tests verify mapping and simulation logic; **a production browser build and deployed Vercel smoke test were not possible in this Linux environment**, because the attached dependency copy includes Windows native Rollup packages only. Rerun the production build with fresh dependencies locally or in CI before deployment.
