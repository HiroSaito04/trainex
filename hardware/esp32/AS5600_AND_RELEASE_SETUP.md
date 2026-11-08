# AS5600 / emergency release / physical inputs — current setup

**Only active firmware:** `hardware/esp32/src/main.cpp` compiled using `hardware/esp32/platformio.ini`.

1. All **13** handle detents require the AS5600; legacy eight-contact rotary contact firmware is **retired**. Wire `3V3 / GND / SDA21 / SCL22` and physically disconnect the old switch contacts.
2. Open PlatformIO Serial Monitor at 115200 baud with the handle at `N`; read `AS5600 RAW=...`. Set `TRAINEX_AS5600_NEUTRAL_RAW` in `include/TrainexHardwareConfig.h`. It defaults to `-1`, which disables master commands until calibrated. Set `TRAINEX_AS5600_REVERSE 1` if P1 reads in the brake direction.
3. Mandatory five buttons: GPIO23 vigilance, GPIO25 EB release, GPIO26 door OPEN, GPIO27 door CLOSE, GPIO33 horn. Each input connects to common GND when pressed.
4. Door LEFT/RIGHT enable buttons on GPIO18/19 and the red security brake on GPIO13 are **optional extras**; `TRAINEX_ENABLE_EXTRA_CONTROLS=0` until installed.
5. GPIO32 is **output to an external active buzzer transistor driver**; `TRAINEX_ENABLE_BUZZER_DRIVER=0` until the driver and current draw are verified.
6. The site starts a session and handles all state, including the three-second EB release, stopped/N conditions, 30/32.5/35-second vigilance sequence, and door-side interlocks. The ESP32 reads/sends commands only.
7. Use Wi-Fi 2.4 GHz and authenticated WSS relay; the Vercel web app is not a direct Wi-Fi endpoint for the board. No Bluetooth.

Detailed table, ground-rail wiring and testing: `circuit/wiring/wiringGuide.md` and `circuit/testing/*.md`.
