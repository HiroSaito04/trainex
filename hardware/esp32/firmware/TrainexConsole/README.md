# TrainexConsole firmware

Target: classic ESP32-WROOM DevKit on Arduino IDE. No Bluetooth.

Arduino Library Manager requirements: `ArduinoJson` v7 and `WebSockets` by Markus Sattler (Links2004). Use the Espressif ESP32 Arduino core.

1. Open `TrainexConsole.ino` as the sketch.
2. Copy `src/config/Secrets.example.h` to `src/config/Secrets.h` and set Wi-Fi SSID/password, device bearer token, and the actual trusted TLS root certificate for your relay. **Do not commit Secrets.h.**
3. Set relay host, port and path in `src/config/DeviceConfig.h`.
4. Set `kEnableWiFi=false` for serial-only operation (recommended first test). The sketch still compiles with Secrets.h in place.
5. Set the 1P12T switch's adjustable stop ring to **8 stops**; wire common to GND and one of its contacts to each kHandlePins entry (EB, B3, B2, B1, N, P1, P2, P3). INPUT_PULLUP means contacts connect to GND.
6. Power from computer USB or a USB power bank using a suitable USB cable; never feed 5 V into a 3.3 V GPIO.
7. A physical EB button here is **not** a certified emergency stop for actual rolling stock: simulator only.

Serial uses 115200 baud, newline-delimited JSON input events (browser adds active session ID after selecting the port).

WSS relies on the user-deployed relay's certificate. The firmware fails closed if the example CA placeholder is still present. Use a current compatible ESP32 core and WebSockets library, and validate TLS behavior before deployment.
