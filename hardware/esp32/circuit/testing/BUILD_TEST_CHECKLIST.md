# PlatformIO Build and Flash Checklist

- [ ] Correct board: ESP32-WROOM-32 development board, USB data cable
- [ ] Open folder `hardware/esp32` containing `platformio.ini`
- [ ] Select `esp32dev` bench profile for initial tests; NO `Secrets.h` needed
- [ ] Build successfully (`pio run -e esp32dev`)
- [ ] Plug ESP32 into USB and identify COM port in Windows Device Manager
- [ ] Upload (`pio run -e esp32dev -t upload`)
- [ ] Open Serial Monitor (`pio device monitor -b 115200`)
- [ ] Press each of seven switches; exactly one event per press
- [ ] Verify the other six buttons stay released in each test
- [ ] Only after bench testing, configure private Secrets.h and build `esp32dev_wifi`
- [ ] Verify relay connection, hardware pairing, device authorization, input validation and each side's door state
- [ ] Future AS5600 is DISABLED and need not be connected
