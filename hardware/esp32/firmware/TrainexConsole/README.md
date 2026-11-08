# LEGACY / archived Arduino IDE firmware — do not flash

The active firmware is **`hardware/esp32/src/main.cpp` under PlatformIO**. Use `hardware/esp32/README.md` and `circuit/wiring/wiringGuide.md` for the current AS5600 / 13-detent pinout.

This old Arduino sketch and modular classes are kept for historical comparison only. They use an obsolete 8-contact master reader, obsolete constants for EB Reset and vigilance, and do not match the current website/hardware control protocol. Do not compile or flash them for the current hardware setup.
