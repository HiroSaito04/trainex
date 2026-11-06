# TRAINEX hardware circuit (no physical LEDs)

Use `mapping/gpioMapping.csv`, `wiring/wiringGuide.md`, and `components/billOfMaterials.csv` together. The only populated hardware inputs are the four buttons and the eight master-handle positions. **No LED outputs are wired or coded.** A passive piezo buzzer is assigned GPIO32 and has PWM firmware, but the actual buzzer/driver circuit and browser feedback integration still need testing.

After testing the real switch contacts and ESP32 pin names, draw the final physical schematic in `schematics/`. No unverified schematic is included here.
