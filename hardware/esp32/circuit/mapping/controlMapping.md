# TRAINEX physical controls -> exact SVG controls -> website command

**Scope:** seven physical momentary buttons and one AS5600 13-notch master handle.
**Input convention:** N.O. switch to GND with ESP32 `INPUT_PULLUP`. Press sends **one** event; release sends none. Every action is subject to the centralized simulator's existing safety interlocks.

| Hardware control | GPIO | Figma SVG clickable/animated layer | WSS `controlId` | WSS `value` | Engine command |
|---|---:|---|---|---|---|
| Left Door Enable | 18 | `LEFT_DOOR_ENABLE_OPEN_BUTTON_DESIGN` | `DOOR_ENABLE_LEFT` | `true` | `DOOR_ENABLE_SET(LEFT)` |
| Left Door Open | 26 | `LEFT_DOOR_OPEN_BUTTON_DESIGN` | `DOORS_OPEN` | `"LEFT"` | `DOOR_OPEN_REQUEST(LEFT)` |
| Left Door Close | 27 | `LEFT_DOOR_CLOSE_BUTTON_DESIGN` | `DOORS_CLOSE` | `"LEFT"` | `DOOR_CLOSE_REQUEST(LEFT)` |
| Right Door Enable | 19 | `RIGHT_DOOR_ENABLE_OPEN_BUTTON_DESIGN` | `DOOR_ENABLE_RIGHT` | `true` | `DOOR_ENABLE_SET(RIGHT)` |
| Right Door Open | 25 | `RIGHT_DOOR_OPEN_BUTTON_DESIGN` | `DOORS_OPEN` | `"RIGHT"` | `DOOR_OPEN_REQUEST(RIGHT)` |
| Right Door Close | 33 | `RIGHT_DOOR_CLOSE_BUTTON_DESIGN` | `DOORS_CLOSE` | `"RIGHT"` | `DOOR_CLOSE_REQUEST(RIGHT)` |
| Vigilance Acknowledge | 23 | `VIGILANCE_BUTTON_DESIGN` | `VIGILANCE_ACKNOWLEDGE` | `true` | `VIGILANCE_ACKNOWLEDGE` |
| Master handle AS5600 | SDA21 / SCL22 | `LEVER_MASTER-CONTROL` | `MASTER_HANDLE` | `EB, B7..B1, N, P1..P4` | `MASTER_HANDLE_SET` |

The website updates these display layers from its **authoritative** train state. They are not additional physical GPIOs:
- `MASTER_HANDLE_TEXTS` / `TEXT_EB`...`TEXT_P4`: active notch yellow (N initially).
- `VIGILANCE_INDICATOR_Lamp_Light_Up`: shown on warning as dictated by engine.
- `All_Doors_Closed_Indicator_Lamp_Light_Up`: shows only when doors closed and secured.
- `All_Doors_Open_Indicator_Lamp_Light_Up`: door-open state.
- `SPEEDOMETER_ARROW` and `TEXT_km/h`: engine speed.
- `Open_Cab_Left_Doors` (train graphic **above**) and `Open_Cab_Right_Doors` (**below**): 32 overlays per side.
- `PANEL_EB/ER` (emergency brake and release), TMS speed/date/time/session ID.

**Critical website compatibility:** Hardware packets for `DOORS_OPEN` / `DOORS_CLOSE` use `"LEFT"` or `"RIGHT"`, not boolean `true`. Apply the included website validator patch before deploying; the existing mapper/engine already accepts these side values. The two `DOOR_ENABLE_*` and `VIGILANCE_ACKNOWLEDGE` controls use boolean `true` as before.

**Excluded from the physical firmware:** horn, emergency-brake-release pushbutton, separate security-brake pushbutton, radio, bypass switches, electrical switches, physical lamps, display hardware, and buzzer. `MASTER_HANDLE=EB` remains functional.
