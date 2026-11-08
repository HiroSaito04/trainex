# Authoritative TRAINEX wiring guide

For the current **seven tactile buttons mounted directly on the breadboard** follow `EXACT_BREADBOARD_PLACEMENT.md`. The active pin mapping is in `../mapping/gpioMapping.csv`.

- ESP32 GND → upper blue rail; bridge actual breaks.
- All seven buttons are normally-open, active LOW and internally pulled up by ESP32.
- Keep the red rail disconnected until an AS5600 is installed.
- No buzzer, physical EB release, horn, LED or security brake circuit is used.
- Use environment `esp32dev` for local bench testing; `esp32dev_wifi` only after configuring private Wi-Fi/relay credentials.
