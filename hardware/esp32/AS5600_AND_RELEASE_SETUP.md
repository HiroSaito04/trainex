# ESP32 configuration after TRAINEX revision

The **PlatformIO active firmware** is `hardware/esp32/src/main.cpp`.

- Default `TRAINEX_USE_AS5600=0`: legacy 8-contact handle still works (EB, B3, B2, B1, N, P1, P2, P3).
- After fitting an AS5600 sensor, change to `TRAINEX_USE_AS5600=1` (or set a compile flag). Connect its 3.3V power, GND, SDA to GPIO21, and SCL to GPIO22. **Disconnect any rotary switch contacts from GPIO21/22** before using I²C.
- Measure the sensor RAW_ANGLE register at Neutral and enter the 0–4095 reading into `AS5600_NEUTRAL_RAW`. Verify P positions read as positive and B as negative. Set `AS5600_REVERSE=true` if necessary.
- The simulator recognizes all 13 detents; the sensor rejects readings farther than 5 degrees from a detent.
- GPIO25 button sends `EMERGENCY_BRAKE_RELEASE`, not RESET. Release requires speed near zero and master handle N and takes 3 seconds in the engine.
- GPIO23 vigilance has been retired and must not be wired as an active command. GPIO32 horn input is disabled to prevent phantom presses while unconnected.
- GPIO26/27 open/close doors **on the selected enabled side**. The chosen side is currently enabled through the corresponding 2D SVG door ENABLE control. No additional enable buttons were assigned to physical GPIO pins in this revision.
- Hardware pairing still needs the externally deployed authenticated WSS relay.
