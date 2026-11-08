# Seven tactile switches, directly mounted on MB-102

- [ ] USB-C unplugged while wiring. ESP32-WROOM-32 30-pin board.
- [ ] Buttons straddle the E–F center trench; check each physical 4-leg switch with a multimeter.
- [ ] ESP32 GND → upper blue (-) rail, actual blue rail splits bridged; GND continuity across all used sections.
- [ ] No ESP32 3V3/red-rail wire in buttons-only stage.
- [ ] GPIO18 → B8; E8/E10 switch left legs; F8/F10 right legs; H8 → blue ground (LEFT ENABLE).
- [ ] GPIO26 → B16; E16/E18 left; F16/F18 right; H16 → blue ground (LEFT OPEN).
- [ ] GPIO27 → B24; E24/E26 left; F24/F26 right; H24 → blue ground (LEFT CLOSE).
- [ ] GPIO19 → B32; E32/E34 left; F32/F34 right; H32 → blue ground (RIGHT ENABLE).
- [ ] GPIO25 → B40; E40/E42 left; F40/F42 right; H40 → blue ground (RIGHT OPEN).
- [ ] GPIO33 → B48; E48/E50 left; F48/F50 right; H48 → blue ground (RIGHT CLOSE).
- [ ] GPIO23 → B56; E56/E58 left; F56/F58 right; H56 → blue ground (VIGILANCE).
- [ ] Each GPIO signal row open to GND when released; short to GND only when pressed.
- [ ] `TRAINEX_ENABLE_AS5600 0` until sensor + magnet are installed.
- [ ] Build `esp32dev` with PlatformIO, upload, then Serial Monitor 115200.
- [ ] Exactly one named press logged per button, no phantom presses.
- [ ] When Wi-Fi is ready, private Secrets.h is not committed and `esp32dev_wifi` is built separately.
