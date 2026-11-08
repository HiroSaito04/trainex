# Modular hardware architecture

```text
[7 N.O. PANEL PUSHBUTTONS]                  [FUTURE AS5600 + MAGNET]
  | GPIO18/26/27/19/25/33/23                | SDA21 / SCL22 / 3V3 / GND
  v                                         v
[ButtonManager]                     [MasterHandleAS5600]
  | INPUT_PULLUP, 35ms debounce             | MAGNET check, neutral calib,
  | press-only event                         | 13 stable notch labels
  +-------------------+---------------------+
                      v
                 [src/main.cpp]
                      |
             [TrainexLink module]
     2.4GHz Wi-Fi -> TLS WebSocket -> device auth -> pairing
                      |
          [TRAINEX REALTIME RELAY SERVER]
                      |
          [VALIDATOR + INPUT ADAPTER]
                      |
    [AUTHORITATIVE TRAIN SIMULATION ENGINE]
      door enable/closed interlocks, vigilance, braking,
      speed, TMS graphics; controls from web/2D/3D/hardware
```

## Control boundary

Hardware firmware does **not** override train safety or simulate motion. It reports intent. The browser's centralized engine validates door side and permission, moves the train, drives SVG indicators, speed and 64 door overlays.

## Input assignments

- LEFT ENABLE: GPIO18 => `DOOR_ENABLE_LEFT`, JSON `true`
- LEFT OPEN: GPIO26 => `DOORS_OPEN`, JSON `"LEFT"`
- LEFT CLOSE: GPIO27 => `DOORS_CLOSE`, JSON `"LEFT"`
- RIGHT ENABLE: GPIO19 => `DOOR_ENABLE_RIGHT`, JSON `true`
- RIGHT OPEN: GPIO25 => `DOORS_OPEN`, JSON `"RIGHT"`
- RIGHT CLOSE: GPIO33 => `DOORS_CLOSE`, JSON `"RIGHT"`
- VIGILANCE: GPIO23 => `VIGILANCE_ACKNOWLEDGE`, JSON `true`
- FUTURE MASTER: I2C GPIO21/22 => `MASTER_HANDLE`, notch string P4..P1, N, B1..B7, EB

## Message contract (compatible with previous TRAINEX project)

After authentication and pairing, a button press produces an event such as:

```json
{"type":"input","deviceId":"trainex-esp32-01","sessionId":"active-session","sequence":12,"controlId":"DOORS_OPEN","value":"LEFT"}
```

The `sessionId` and `sequence` are runtime generated, not hard-coded. The application/relay must validate device authentication, allowed commands, pairing and sequence numbers.

## Fault handling and honest limitations

- On missing Wi-Fi/relay/session, presses remain visible in Serial but are **not queued**. This avoids executing stale actions after a reconnect.
- Missing AS5600 or magnet does not block physical buttons. Master commands are disabled until the sensor is installed and calibrated.
- The hardware cannot independently ensure the train stops on lost connectivity; the **web simulation engine** should implement a disconnect policy if required.
- A shared ground is required. Do not confuse the blue power rail with signal rows or cross the center trench accidentally.
- No dedicated physical e-stop circuit is included in this educational prototype. It must never be used to operate real rolling stock.
