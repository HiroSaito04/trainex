# Physical MB-102 breadboard placement — seven four-pin switches DIRECTLY ON the board

The placement below assumes a 63-row breadboard with **A–E** strips, center trench, **F–J** strips, and a long upper blue (−) rail. Some boards have fewer rows or different numbering. Check before placing switches. USB must be unplugged during wiring.

## Step 1: shared ground

1. ESP32 `GND` → upper blue (−) rail.
2. Bridge every **actual electrically broken blue-rail section**, not blindly every printed line. Verify continuity between all sections with a meter.
3. **Leave red (+) rail disconnected** and do not connect 3V3 for buttons-only testing.

## Step 2: mount each button across E–F CENTER TRENCH

For a standard 6 × 6 mm four-leg tactile button that fits these two rows, place two legs in **E8/E10** and two in **F8/F10**. E8 and F8 are **NOT** electrically connected by the breadboard; they connect only when the switch closes (assuming the internal switch contact layout described below). Repeat at row pairs 16/18, 24/26, etc.

**CRITICAL:** On four-leg tactile switches, a pair of pins may be permanently shorted inside the component. Before powering, test the switch with a multimeter and orient it so E8 ↔ F8 is **open when released** and **short only when pressed**. If not, rotate/rearrange the button; never assume the switch contact orientation. If your buttons have a different footprint, use another isolated pair of breadboard strips.

| Control | GPIO | Two switch holes left (E) | Two switch holes right (F) | ESP32 GPIO jumper | Ground jumper |
|---|---:|---|---|---|---|
| LEFT ENABLE | 18 | E8, E10 | F8, F10 | GPIO18 → B8 | H8 → blue ground rail |
| LEFT OPEN | 26 | E16, E18 | F16, F18 | GPIO26 → B16 | H16 → blue ground rail |
| LEFT CLOSE | 27 | E24, E26 | F24, F26 | GPIO27 → B24 | H24 → blue ground rail |
| RIGHT ENABLE | 19 | E32, E34 | F32, F34 | GPIO19 → B32 | H32 → blue ground rail |
| RIGHT OPEN | 25 | E40, E42 | F40, F42 | GPIO25 → B40 | H40 → blue ground rail |
| RIGHT CLOSE | 33 | E48, E50 | F48, F50 | GPIO33 → B48 | H48 → blue ground rail |
| VIGILANCE | 23 | E56, E58 | F56, F58 | GPIO23 → B56 | H56 → blue ground rail |

### Why B8 / E8 / H8?

A8–E8 form ONE connected five-hole signal strip. F8–J8 form a SEPARATE five-hole strip. The center trench disconnects the two halves. So `B8 → E8` carries the signal to one contact, and `F8 → H8` carries the opposite contact to the ground rail. A switch bridges only when pressed.

Do NOT place a signal wire in the blue rail: that would make the input permanently LOW. Do NOT put both GPIO and ground jumpers into the same five-hole terminal strip.

## Step 3: continuity test BEFORE USB

- ESP32 GND → every upper blue rail section: continuous.
- Every GPIO signal row (e.g., B8) → GND: **open when released**, **continuous when pressed**.
- No short between blue GND rail and an unconnected red (+) rail.
- Every signal jumper in a unique row, no accidental sharing.

## Step 4: apply USB and test

Use the **`esp32dev` bench build** and 115200 Serial Monitor. Trigger the seven switches one at a time. A correct press produces one `BUTTON` log; releasing it prints nothing. If you see a button printing without being pressed, disconnect USB and check whether its GPIO has been shorted to the ground rail.

## Future AS5600

GPIO21 SDA, GPIO22 SCL; 3V3 and GND to its module. Not used in the seven-button bench test, and its firmware is disabled by default.
