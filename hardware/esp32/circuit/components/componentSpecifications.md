# Active hardware component specifications

- **ESP32-WROOM classic, 30-pin USB-C:** one board, ESP32 digital inputs configured `INPUT_PULLUP`, 3.3 V logic, USB-C for programming/power.
- **AS5600 angle sensor:** one sensor, I2C at address `0x36`; 3V3 supply, GPIO21=SDA, GPIO22=SCL, GND; 12-degree detent spacing, from -96 degree EB to +48 degree P4.
- **Seven 6x6mm four-leg tactile N.O. switches mounted across breadboard trench:** one each left enable, left open, left close, right enable, right open, right close, vigilance. All active LOW to common GND, 35 ms debouncing. See mapping.
- **Breadboard + jumpers:** 830 tie-point breadboard, GND rail bridged across manufacturer split(s), optional 3V3 rail for AS5600 only.
- **Mechanics:** source-specified 3D-printed lever, 8 mm steel shaft, 8 mm bearing, 8 mm collar, spring plunger, M5 x 40 mm bolt, shaft-end magnetic coupling.
- **Existing active piezo buzzer:** listed in materials PDF, **not connected or enabled** in this scoped build.
- **No hardware LEDs:** all door/EB/vigilance indicator lighting remains in SVG/TMS, not physical outputs.

**Source versus design decision:** source PDF has an earlier limited pushbutton plan; exactly seven buttons are required by the current user-defined hardware scope. Source material does not itself fix GPIOs or browser protocol; those are TRAINEX implementation assignments.
