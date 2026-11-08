# AS5600 (future master handle, not required for current seven-button build)

1. Do not wire the sensor until it and the matching shaft magnet are installed.
2. ESP32 3V3 → sensor VCC; ESP32 GND → GND; GPIO21 → SDA; GPIO22 → SCL. Check board pin labels and that I²C pull-ups are to 3.3 V.
3. Enable `TRAINEX_ENABLE_AS5600=1` and read raw angle at mechanical Neutral using the Serial Monitor.
4. Set `TRAINEX_AS5600_NEUTRAL_RAW` to the actual value. Check direction with P1 and adjust `TRAINEX_AS5600_REVERSE` if needed.
5. Confirm all 13 detents are stable before enabling actual master-handle commands.
