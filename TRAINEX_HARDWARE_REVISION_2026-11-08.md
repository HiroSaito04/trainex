# TRAINEX | hardware mapping, wiring and firmware revision | 8 Nov 2026

## Scope
- Replaces **active PlatformIO** `hardware/esp32/src/main.cpp` eight-contact firmware with **AS5600 I2C, 13 detents**.
- Adds missing `include/TrainexHardwareConfig.h` (single GPIO map) and `include/Secrets.example.h` (private template only, no credentials).
- Restores vigilance (GPIO23) and sets EB RELEASE (GPIO25), OPEN (GPIO26), CLOSE (GPIO27), HORN (GPIO33).
- Supports optional extra hardware: LEFT ENABLE (GPIO18), RIGHT ENABLE (GPIO19), separate SECURITY BRAKE (GPIO13); OFF by default until buttons are installed.
- GPIO32 is **only** an optional buzzer transistor-driver output; OFF by default until safe transistor/supply installed.
- The web/contracts/input manager/relay now recognize vigilance and HORN (press/release), with `hornActive` simulator state. The horn's web UI/audio effects remain for future work; physical active buzzer can sound horn locally once driver installed.
- Browser Hardware-page WebSocket adapter sends paired `state_feedback.vigilanceBuzzer` to the ESP32, throttled; web engine owns timing.
- Existing 2D SVG design and 3D assets were not altered.

## Entry points
- Firmware **ACTIVE**: `hardware/esp32/src/main.cpp` (VS Code PlatformIO, classic ESP32-WROOM-32).
- GPIO / options: `hardware/esp32/include/TrainexHardwareConfig.h`.
- Wiring: `hardware/esp32/circuit/wiring/wiringGuide.md`.
- Machine-readable pin map: `hardware/esp32/circuit/mapping/gpioMapping.csv`.
- Input mapping: `hardware/esp32/circuit/mapping/controlMapping.md`.
- Materials/driver extras: `hardware/esp32/circuit/components/billOfMaterials.csv`.
- Physical and input test checklists: `hardware/esp32/circuit/testing/`.
- Legacy Arduino sketch retained as **retired** with a compile-time block to avoid flashing outdated 8-contact pin assignments.

## Quick steps
1. **Remove** legacy GPIO21/22 rotary contacts and wire AS5600 `3V3,GND,SDA21,SCL22`.
2. Bridge split breadboard ground rail with jumper (verify continuity), and connect 5 normally-open buttons from 23,25,26,27,33 to GND.
3. Copy `hardware/esp32/include/Secrets.example.h` to `Secrets.h` and set Wi-Fi/WSS relay credentials privately.
4. Upload via PlatformIO; with lever physically N, read `AS5600 RAW=...` at 115200 baud and set `TRAINEX_AS5600_NEUTRAL_RAW` from -1 to that reading. Set `TRAINEX_AS5600_REVERSE=1` if moving toward P1 reads as braking.
5. Confirm all 13 detents. Install optional extra controls and active buzzer **only after** checking material/driver requirements.
6. Deploy authenticated WSS relay separately and pair browser session via Hardware tab.

## Tests and limitations
- `npm run test:hardware` : **15 tests passed** in the prepared Node workspace.
- Includes source/hardware/protocol unit tests. The physical ESP32 firmware was **not compiled/flashed/tested on the actual 30-pin board**; actual module orientation, magnet gap, GPIO continuity and relay pairing still need hands-on checks.
- A production web build was not completed in this environment (preinstalled dependencies are incomplete); rebuild locally (`npm install`, `npm run test:hardware`, `npm run build --workspace=./apps/web`).
- Full browser/relay/hardware validation and Vercel deployment remain to be done.
- Source PDF *Hardware Materials & Technical Specifications* is preserved as a reference, not silently modified.
