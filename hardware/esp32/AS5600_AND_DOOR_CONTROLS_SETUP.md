# Quick setup: AS5600 + 7 switches

- **Active source:** `src/main.cpp` via PlatformIO (older 8-contact firmware removed from this ZIP).
- **Master handle:** VCC=3V3, GND=GND, SDA=GPIO21, SCL=GPIO22. Configure Neutral RAW angle. Positions EB B7..B1 N P1..P4.
- **Left:** ENABLE=GPIO18; OPEN=GPIO26; CLOSE=GPIO27.
- **Right:** ENABLE=GPIO19; OPEN=GPIO25; CLOSE=GPIO33.
- **Vigilance:** GPIO23.
- **Button contacts:** Normally open, each GPIO wired to common GND when pressed; built-in pullups.
- **Other physical controls:** none.
- **Firmware events:** door OPEN/CLOSE `value` is `LEFT` or `RIGHT`; apply included website validator patch.
- **Electrical:** no 5V on GPIO, bridge split ground rails, leave GPIO32 disconnected, do not connect AS5600 to old eight-switch contacts.
