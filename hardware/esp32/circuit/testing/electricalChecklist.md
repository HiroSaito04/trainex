# Electrical safety checklist

- [ ] ESP32 unplugged while installing/moving jumper wires.
- [ ] Board silkscreen confirms actual GPIO pin labels (not header physical index numbers).
- [ ] GND blue rail split(s) bridged and continuity verified end-to-end.
- [ ] 3V3 red rail never shorted to GND and never tied to 5V/VIN.
- [ ] AS5600 VCC and I2C pull-ups 3.3 V-compatible, GND common, SDA21/SCL22.
- [ ] Every pushbutton has opposite switching contacts to GPIO and GND (not same internally shorted pair).
- [ ] GPIO18,19,23,25,26,27,33 each have only the specified button; GPIO32 and GPIO13 unused.
- [ ] Old 8-contact switch wiring and old GPIO25 EB release/GPIO33 horn wiring fully removed.
- [ ] Seven buttons present and individually test LOW when pressed, HIGH when released.
- [ ] No physical LEDs, buzzer, relay, or train-control voltage connected.
