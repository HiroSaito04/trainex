> **HISTORICAL / SUPERSEDED:** This document describes the previous vigilance and EB Reset implementation. Do NOT follow it for the 2026-11-08 TRAINEX revision. Refer to `TRAINEX_REVISION_2026-11-08.md` instead.

# TRAINEX — Vigilance & Emergency Brake Reset changes

## Operating behavior (prototype, not railway-certified)
- **Master handle `EB`** is the cab emergency-brake activation control. No independent emergency-activate button is exposed in 2D/3D.
- **EB RESET button** replaces the previous separate emergency-activate button in the existing 2D and 3D desk position. It can clear a latched emergency brake only at standstill with the master handle at `N`.
- **Vigilance acknowledgement** is now a working button in both 2D and 3D cabins. At train speeds of at least 10 km/h, the engine monitors time without a qualifying driver control action. Moving the master handle to a different detent or pressing Vigilance Acknowledge resets the timer.
- At **30 seconds** visual warning starts, at **32.5 seconds** the buzzer joins the visual warning, and at **35 seconds** propulsion is inhibited and penalty emergency braking is latched. These times follow the provided PNR specification excerpt; complete fleet/UIC compliance remains unverified.
- Acknowledgement resets the vigilance timer and warning. After a trip, acknowledge vigilance first, stop fully and select `N`, then operate **EB RESET**.
- Vigilance is not running when the session is paused, and its pending timer resets below 10 km/h (without canceling an existing trip).

## Hardware wiring (classic ESP32-WROOM)
| Physical control | Pin | Connection |
| --- | --- | --- |
| Vigilance acknowledge push button | GPIO23 | Normally-open contact to GND (`INPUT_PULLUP`) |
| Emergency Brake Reset push button | GPIO25 | Normally-open contact to GND |
| Door Open | GPIO26 | Normally-open contact to GND |
| Door Close | GPIO27 | Normally-open contact to GND |
| Master control handle EB/B3/B2/B1/N/P1/P2/P3 | GPIO13/14/16/17/18/19/21/22 | Existing 8-contact rotary mapping, common GND |

The former **physical emergency activation button** on GPIO23 is now the **vigilance acknowledgement button**. The physical emergency braking function remains available through the master handle EB detent.

## Integration notes
- Shared contracts, engine, input-manager mapping, 2D, 3D, ESP32 firmware, and the optional training bridge have been updated.
- Preserve the original 2D SVG and 3D GLB; visual labels are overlays so original artwork can be restored without editing models.
- Website hardware relay authentication/pairing and real ESP32 testing remain independent integration tasks.
- This prototype should be validated against the relevant real train's vigilance/safety procedures before being claimed operationally accurate.
