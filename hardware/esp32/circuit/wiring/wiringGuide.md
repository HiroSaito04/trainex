# Wiring guide — 3.3 V only

- Rotary common → GND. Each throw → corresponding ESP32 input GPIO13,14,16,17,18,19,21,22. Mechanical eight-stop ring required.
- Emergency pushbutton one terminal → GPIO23, other → GND.
- Emergency reset → GPIO25/GND.
- Door Open → GPIO26/GND.
- Door Close → GPIO27/GND.
- Door Closed LED GPIO32 → 330Ω resistor → LED anode; LED cathode → GND.
- EB LED GPIO33 → 330Ω resistor → LED anode; LED cathode → GND.
- Power via USB (avoid separate power wiring); use insulated wiring and cable strain relief.

Do not wire any switch to 5 V; the firmware uses internal pull-ups. Avoid an alternate ESP32 board without reviewing strapping pins and available GPIOs.
