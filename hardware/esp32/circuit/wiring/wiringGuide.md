# TRAINEX wiring guide — NO PHYSICAL LEDs

**Board:** Classic ESP32-WROOM Type-C development board, USB powered, 3.3 V GPIO.

## Button-only prototype (digital `INPUT_PULLUP`)
1. Connect the ESP32 **GND** pin to the breadboard common ground rail.
2. Connect one normally-open Vigilance button terminal to **GPIO23**; its other terminal to the **GND** rail.
3. Connect one normally-open EB Reset button to **GPIO25** and **GND**.
4. Connect Door Open to **GPIO26** and **GND**.
5. Connect Door Close to **GPIO27** and **GND**.
6. Power the ESP32 through its USB-C port using a **data-capable** USB cable.

Do not wire button contacts to 3.3 V or 5 V. With internal pull-ups, pressed=LOW, released=HIGH. Four-legged tactile buttons often have internally common pairs; verify with a multimeter.

## Master control handle (full console)
- Use a non-shorting 1P12T rotary selector mechanically limited to **8 detents**.
- Wire its common/wiper terminal to **GND**.
- Wire the eight throw contacts in the **physical selected-detent order**: EB → GPIO13; B3 → 14; B2 → 16; B1 → 17; N → 18; P1 → 19; P2 → 21; P3 → 22.
- Use a multimeter to identify the real contact order. Neither the pin position nor shaft rotation direction can be assumed from a generic diagram.
- Selecting EB is the only physical emergency-brake activation input in this configuration.

## Buzzer / indicators
- **There are no physical LEDs** and no LED resistors to wire.
- **GPIO32 is assigned to a passive piezo buzzer**: low-current, 3.3V-compatible piezo positive to GPIO32 and negative to GND. For any higher-current or higher-voltage buzzer, use an appropriate transistor driver and external supply as specified by the component; never connect a 5 V load directly to GPIO.
- Vigilance and emergency status are still displayed in the website, not on physical LEDs.

## Safety
Only connect the ESP32 to this low-voltage prototype. Never connect GPIO to any real train's control or safety circuits. Secure cables and avoid shorts before applying USB power.
