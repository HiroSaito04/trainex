# TrainexConsole firmware — no physical LEDs

**Hardware:** Classic ESP32-WROOM Type-C, four normally-open pushbuttons, optional 8-contact master selector; optional low-current passive piezo buzzer on GPIO32 with PWM driver. **No physical LEDs.** Virtual indicator lamps on the website are unchanged.

## Arduino dependencies
Install Espressif's **esp32** board package, `ArduinoJson` 7 and `WebSockets` by Markus Sattler. No Bluetooth transport.

## Flash firmware / first button test
1. Open `TrainexConsole.ino` in Arduino IDE.
2. Copy `src/config/Secrets.example.h` to `src/config/Secrets.h` (the source includes this file, even in USB-only mode). Keep it private. Use placeholders for Wi-Fi credentials until Wi-Fi testing.
3. In `src/config/DeviceConfig.h`, set `kEnableWiFi=false`, `kEnableUsbSerial=true` for initial testing. Use **one** active transport when testing the website to avoid duplicate inputs.
4. Confirm `src/config/HardwarePins.h` and physical wiring. GPIO23=Vigilance; GPIO25=EB Reset; GPIO26=Door Open; GPIO27=Door Close.
5. Select correct ESP32 board/COM port; upload sketch and open Serial Monitor at 115200 baud.
6. Press each button and verify one JSON `input` event per press. Master handle sends `MASTER_HANDLE` events with the eight values.

## Wi-Fi/WSS after software integration
1. Set real Wi-Fi SSID/password, per-device token and valid relay CA PEM in private `Secrets.h`.
2. Configure WSS host/port/path in `DeviceConfig.h` and set `kEnableWiFi=true`. Disable USB serial output for website testing unless debugging.
3. Deploy the relay as a persistent HTTPS/WSS-enabled service and provide authenticated browser pairing in the website. The currently shipped website Hardware page does **not** complete this handshake as-is.
4. Pair with an active simulation session. Test all physical inputs and reconnection.

## Scope
- No independent physical emergency-activation button: master handle `EB` triggers it.
- No physical LED code: the former `IndicatorController` and GPIO32/GPIO33 LED assignments were removed.
- `DisplayController` is an inert placeholder (no physical display connected).
- The passive piezo PWM buzzer is implemented on GPIO32 and is controlled by `state_feedback.vigilanceBuzzer`. It requires compatible low-current hardware (or a suitable driver). The website pairing/feedback path still needs integration/testing.
- No real train circuits or safety systems may be connected to this educational prototype.

## PNR vigilance buzzer
At speed >= 10 km/h, the website engine begins a 30-second inactivity countdown. Browser visual alert starts at 30 seconds, physical buzzer at 32.5 seconds (through feedback), and the penalty emergency brake is triggered at 35 seconds. A changed master handle detent or the vigilance button resets the timer before a trip. The buzzer requires a paired live feedback path; local Serial Monitor tests only prove inputs.
