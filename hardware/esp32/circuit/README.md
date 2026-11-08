# TRAINEX seven-button circuit

The seven tactile switches are **mounted directly on the MB-102 breadboard**, each straddling the center E–F trench.

**Authoritative wiring documentation:**
- `wiring/EXACT_BREADBOARD_PLACEMENT.md` — direct-placement and continuity testing
- `mapping/gpioMapping.csv` — pins and website commands
- `schematics/MB102_Seven_Buttons.svg` — color-coded conceptual wiring drawing
- `testing/WIRING_VERIFICATION_CHECKLIST.md` — physical inspection

Buttons use `INPUT_PULLUP` and common GND. Leave 3V3 disconnected until AS5600 sensor is installed later.
