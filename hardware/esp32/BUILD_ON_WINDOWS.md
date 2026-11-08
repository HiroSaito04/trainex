# Windows quick start (VS Code + PlatformIO)

1. Extract this ZIP **before** opening files.
2. Install VS Code and its PlatformIO IDE extension. Restart VS Code if necessary.
3. **File > Open Folder** → select the extracted `hardware/esp32` directory that contains `platformio.ini`.
4. In PlatformIO project tasks choose **env:esp32dev** (BENCH) → **Build**. It requires a one-time download of the ESP32 toolchain/Arduino framework.
5. Connect the ESP32 with a **USB-C data cable**, select its COM port, then choose **Upload**. Some boards require CP210x or CH340 drivers; press BOOT while connecting/uploading if the board requests it.
6. Choose **Monitor** (115200 baud). Every separate switch press should show its name. No sensor, Wi-Fi or login is required for this bench test.
7. Only after all buttons work, copy `include/Secrets.example.h` → `include/Secrets.h`, enter private credentials, and choose the **esp32dev_wifi** profile for TRAINEX website pairing.

Commands if `pio` is on PATH:

```powershell
pio run -e esp32dev
pio run -e esp32dev -t upload
pio device monitor -b 115200
```

**Never flash `.pio/build/esp32dev/firmware.bin` from someone else's ZIP.** Always build from this project's source.
