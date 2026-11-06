# Electrical checklist (no physical LEDs)
- [ ] Confirm classic ESP32-WROOM and GPIO labels on your actual board.
- [ ] The four pushbuttons are normally-open and connect GPIO-to-GND only.
- [ ] Verify GPIO23 Vigilance, GPIO25 EB Reset, GPIO26 Door Open, GPIO27 Door Close.
- [ ] All eight master selector contacts match GPIO13/14/16/17/18/19/21/22; common to GND.
- [ ] No input is shorted to USB 5 V or other power supply.
- [ ] GPIO32 is the passive piezo buzzer output and GPIO33 remains unused; no physical LEDs are attached.
- [ ] Verify buzzer is a 3.3V-compatible low-current passive piezo, or install a suitably rated transistor driver before connecting it to GPIO32.
- [ ] USB cable supports data; all wiring secure and insulated.
