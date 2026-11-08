# TRAINEX ESP32 Hardware — Build and Upload

**Use this folder as the PlatformIO project:** `hardware/esp32/`. It is the single active firmware project.

Hardware: classic **ESP32-WROOM-32** development board, **seven four-leg normally-open tactile switches** mounted **directly on an MB-102-style breadboard**, no magnet sensor yet.

## Start with a safe bench test (no Wi-Fi required)

1. **USB disconnected:** Install the seven tactile buttons across the center channel of the breadboard, at the row pairs in `circuit/wiring/EXACT_BREADBOARD_PLACEMENT.md`. Use a multimeter to identify the actual normally-open contact pair for your button model.
2. Wire ESP32 GND to an upper blue (−) rail. Bridge actual rail discontinuities using male-to-male wires, tested for continuity. **Do not connect ESP32 3V3 to red rail yet.**
3. Wire each GPIO to the A–E signal row listed below, with its switch's other contact connected from the F–J side to the blue ground rail. See placement document.
4. Install VS Code + PlatformIO extension, then **File → Open Folder → `hardware/esp32`** (this folder contains `platformio.ini`).
5. Pick PlatformIO environment **`esp32dev`** and click **Build**, **Upload**, then **Monitor** at **115200 baud**. CLI: `pio run -e esp32dev`, `pio run -e esp32dev -t upload`, `pio device monitor -b 115200`.
6. Press each button once. The monitor should print one event, e.g. `BUTTON DOORS_OPEN LEFT (bench)`. Released switches do not print a command.

**No private configuration file is required for this bench-test build.** `TRAINEX_ENABLE_AS5600=0` until your sensor and shaft magnet are installed.

## GPIO table (active LOW, internal pull-up)

| Button | ESP32 GPIO | Signal breadboard row | Other side |
|---|---:|---|---|
| Left Door Enable | 18 | B8/E8 | F8/H8 → blue GND rail |
| Left Door Open | 26 | B16/E16 | F16/H16 → blue GND rail |
| Left Door Close | 27 | B24/E24 | F24/H24 → blue GND rail |
| Right Door Enable | 19 | B32/E32 | F32/H32 → blue GND rail |
| Right Door Open | 25 | B40/E40 | F40/H40 → blue GND rail |
| Right Door Close | 33 | B48/E48 | F48/H48 → blue GND rail |
| Vigilance | 23 | B56/E56 | F56/H56 → blue GND rail |

Each tactile switch typically occupies two rows: E8/E10 on the left of the trench and F8/F10 on the right (likewise 16/18, etc.). This placement is valid **only if your switch contacts are connected along each side and open across the trench**. Confirm with continuity testing, since switch geometries vary. Never bridge the signal and ground side permanently.

## Connected TRAINEX build (only after button tests pass)

1. Copy `include/Secrets.example.h` to `include/Secrets.h` (private, ignored by Git) and enter your 2.4 GHz Wi-Fi name/password, relay hostname, device ID and token.
2. Pick environment **`esp32dev_wifi`**, build and upload it. This environment downloads ArduinoJson and WebSockets libraries.
3. Pair from the live TRAINEX Hardware tab using a compatible, deployed relay and website validation.
4. Wi-Fi mode sends authenticated session-bound button commands; button presses are never queued across connection outages.

Commands: `DOOR_ENABLE_LEFT/RIGHT=true`, `DOORS_OPEN/CLOSE=LEFT/RIGHT`, `VIGILANCE_ACKNOWLEDGE=true`. The actual simulation engine, not the ESP32, enforces speed/door/safety interlocks.

## Future 13-position master handle

Reserved: SDA GPIO21, SCL GPIO22, ESP32 3V3, GND. Set `TRAINEX_ENABLE_AS5600=1`, install a correct magnet and AS5600, and calibrate `TRAINEX_AS5600_NEUTRAL_RAW` before enabling it. Until then this module sends **no** master-handle inputs. No physical horn, EB-release button, separate security-brake button, output LED, or buzzer is enabled in this hardware profile.

## Project structure

- `src/main.cpp` — firmware entry point
- `src/inputs/` — seven button inputs and debounce logic
- `src/sensors/` — future AS5600 master handle
- `src/communication/` — bench serial output or Wi-Fi/WSS (build-profile selected)
- `include/TrainexHardwareConfig.h` — GPIOs, timings, AS5600 settings
- `include/Secrets.example.h` — private relay configuration template
- `circuit/` — GPIO maps, wiring, testing and diagrams
- `tests/` — offline mapping and detent classifier checks
- `integration/website-patch/` — optional website/relay schema snippets, not flashed to ESP32

## Notes

- This package intentionally excludes all private `Secrets.h`, old `firmware.bin`, and obsolete eight-contact Arduino sketches. Rebuild from source rather than flashing archived binaries.
- If real Wi-Fi credentials or relay tokens were shared in a previous ZIP, rotate them.
- The connected build and live physical pairing must be tested on your computer/hardware before deployment. This educational console must never be used to control an actual train.
