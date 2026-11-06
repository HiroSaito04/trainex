# USB serial tests
1. Set `kEnableWiFi=false`, `kEnableUsbSerial=true`; configure `Secrets.h` as needed for compilation.
2. Upload the ESP32 sketch and open Arduino Serial Monitor at **115200 baud**.
3. Press each button and move each handle position; verify newline-delimited JSON messages.
4. For browser testing, the software team must expose and integrate the existing `WebSerialTransport` on TRAINEX's Hardware page. Use Chromium over HTTPS/localhost and select the serial port by user click. **Close Serial Monitor first** so it releases the COM port.
5. Start a simulation session and test button inputs plus state synchronization; test disconnect and reconnect.
