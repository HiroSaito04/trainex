# TRAINEX hardware specifications — no physical LED indicators

- **MCU:** Classic ESP32-WROOM Type-C development board, 3.3 V GPIO, USB-powered.
- **Momentary switches (4):** normally-open contact, one terminal to an assigned GPIO and the other to GND, read via `INPUT_PULLUP`.
- **Master lever:** non-shorting 1P12T selector mechanically limited to 8 positions (EB, B3, B2, B1, N, P1, P2, P3). Common to GND; eight contacts to mapped GPIO pins.
- **Buzzer:** planned but not yet assigned in firmware; identify active/passive type and its current rating before choosing a driver or pin.
- **LEDs:** none; status lamps remain virtual on the 2D/3D displays.
- **Power:** data-capable USB cable for programming/testing; suitable USB power supply for untethered Wi-Fi use. Do not apply 5 V to a GPIO.
- **Connection:** Wi-Fi/WSS intended after pairing is integrated; USB Serial for first local hardware test. No Bluetooth.

## PNR vigilance buzzer
GPIO32 sends a 2.2 kHz PWM tone to a low-current 3.3 V-compatible passive piezo when browser feedback sets `vigilanceBuzzer=true` (32.5 s to 35 s). For an active, high-current or 5V buzzer, verify its module specification and use a suitably rated transistor driver rather than direct GPIO.
