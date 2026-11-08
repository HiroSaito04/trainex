# TRAINEX 7-button hardware scope

The ESP32 connects **exactly 7 physical N.O. buttons plus one AS5600 13-detent master handle**. This supersedes earlier five-button/generic door commands and proposals to physically wire all illustrated cabin switches. Design SVG is unchanged.

- GPIO18 LEFT ENABLE; GPIO26 LEFT OPEN; GPIO27 LEFT CLOSE.
- GPIO19 RIGHT ENABLE; GPIO25 RIGHT OPEN; GPIO33 RIGHT CLOSE.
- GPIO23 VIGILANCE.
- GPIO21/22 AS5600 I2C, VCC 3V3, common GND.

The WSS hardware device sends `DOORS_OPEN/CLOSE` with a string `"LEFT"` or `"RIGHT"` so each bank is independent. The **relay and browser validators were updated** to accept these explicit sides. Master handle values remain EB B7..B1 N P1..P4. All display layers and virtual lamps remain driven by the existing simulator state.

**No additional physical functions**: do not wire horn, EB release, security brake, radio, electrical switches, bypass switches, indicator lamps, or buzzer. Emergency braking is still possible through the master-handle EB notch; emergency release can be performed through existing website TMS control.

See `hardware/esp32/README.md`, `hardware/esp32/circuit/wiring/wiringGuide.md`, and `hardware/esp32/circuit/mapping/controlMapping.md`. Do not include `Secrets.h` or `.pio` in version control. The original Figma SVG is untouched.
