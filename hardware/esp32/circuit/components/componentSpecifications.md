# TRAINEX ESP32 hardware specifications

Classic ESP32-WROOM (3.3 V GPIO). 1P12T selector mechanically limited to exactly eight detents and configured non-shorting. Use **normally open** pushbuttons with `INPUT_PULLUP` wired to GND. Put a separate 330-ohm resistor in series with each optional 3.3 V LED. Use a real strain-relieved cab enclosure and a matching USB cable. Do not put 5 V on any GPIO pin. Power via USB power bank or PC (no BLE). Use no mains wiring or train safety-critical control connection.
