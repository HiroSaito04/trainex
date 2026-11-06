# Input / software integration checklist
- [ ] Four pushbuttons each produce one correct event per press after debounce.
- [ ] GPIO23 sends `VIGILANCE_ACKNOWLEDGE`, not `EMERGENCY_BRAKE_ACTIVATE`.
- [ ] Master handle eight detents map EB, B3, B2, B1, N, P1, P2, P3.
- [ ] Only master handle `EB` activates emergency braking physically.
- [ ] Emergency reset follows simulation safety conditions (stationary, N, vigilance acknowledged if tripped).
- [ ] Door Open/Close follow engine interlocks.
- [ ] Vigilance warning and trip are visible on virtual 2D/3D indicators; no physical LEDs.
- [ ] USB and Wi-Fi/WSS are tested **separately**; no duplicate delivery.
- [ ] Buzzer behavior tested only after design/code are added.
