# TRAINEX ESP32 — VS Code + PlatformIO only

Requires a **classic ESP32-WROOM-32** (or compatible ESP32 dev module), a USB data cable, and 2.4 GHz Wi-Fi. No Arduino IDE, Bluetooth, or LEDs are needed.

## Steps

1. Install PlatformIO IDE extension in VS Code.
2. Open the folder `hardware/esp32/` as a PlatformIO project in VS Code (it contains `platformio.ini`).
3. Copy `include/Secrets.example.h` to `include/Secrets.h`.
4. Set the 2.4 GHz network name/password, the HTTPS relay hostname (without `https://`), unique device ID and matching relay device token.
5. **Verify the TLS certificate authority.** `include/TrainexRootCA.h` contains the public ISRG Root X1 CA. It works only if the relay domain's certificate chains to this CA. Replace it with the correct publicly trusted root if your host uses a different chain; do not disable TLS certificate checks.
6. Connect ESP32 by USB data cable. VS Code PlatformIO: Build, Upload, Serial Monitor (115200 baud).
7. Check for `Device authenticated` in Serial Monitor. After the browser pairs, look for `Paired to session: ...`.

## Wiring — buttons and 8-position non-shorting rotary

All common switch terminals connect to **GND** (not 5V). Each rotary throw contact or momentary button connects its configured GPIO to GND when selected/pressed. Firmware uses `INPUT_PULLUP`. Route grounds carefully and keep wires short; debouncing is performed in software.

| Hardware | GPIO | Input event |
|---|---:|---|
| Master detent EB | 13 | `MASTER_HANDLE: EB` |
| Master B3 | 14 | `MASTER_HANDLE: B3` |
| Master B2 | 16 | `MASTER_HANDLE: B2` |
| Master B1 | 17 | `MASTER_HANDLE: B1` |
| Master Neutral N | 18 | `MASTER_HANDLE: N` |
| Master P1 | 19 | `MASTER_HANDLE: P1` |
| Master P2 | 21 | `MASTER_HANDLE: P2` |
| Master P3 | 22 | `MASTER_HANDLE: P3` |
| Emergency Brake Reset button | 23 | `EMERGENCY_BRAKE_RESET: true` |
| Door Open button | 25 | `DOORS_OPEN: true` |
| Door Close button | 26 | `DOORS_CLOSE: true` |
| Horn button | 27 | `HORN: true` on press, `false` on release |
| Vigilance switch | 32 | `VIGILANCE_ACK: true` on press |

**Important:** This pin plan assumes an 8-detent switch with 8 independently wired throws. A plain potentiometer, encoded rotary switch, or different master lever requires different firmware input logic. Some development boards expose fewer pins; verify your board's labels and electrical limits. EB is a master-handle detent, not a separate emergency-brake button. No hardware LEDs are used.

## Behavior

The ESP32 sends only hardware input events while paired. Vigilance timing (30s warning, 32.5s buzzer, 35s penalty brake) and braking interlocks belong in TRAINEX's authoritative simulation engine, **not in ESP32 firmware**. The hardware relay recognizes `HORN` and `VIGILANCE_ACK` event IDs, but simulator input handlers must also accept them for visible/audible effects.
