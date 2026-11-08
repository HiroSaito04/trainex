# Vigilance button and buzzer — current firmware

- Vigilance acknowledge button: **GPIO23 -> normally-open contact -> GND**.
- The 2D simulator's vigilance indicator and TMS warnings are virtual; no physical LEDs.
- Current simulation timer: visual 30 s, buzzer 32.5 s, penalty EB 35 s **when the configured movement requirement is met**. The ESP32 has no independent timer.
- If the active buzzer driver is installed and enabled, relay `state_feedback.vigilanceBuzzer` turns GPIO32's transistor driver on/off. The web browser must be paired with the ESP32 through a separate WSS relay.
- GPIO25 is now **Emergency Brake RELEASE**, not reset. EB release checks stopped + master Neutral and takes the specified 3 s in the web simulation engine.
- Do not use GPIO32 as a horn switch input; the horn input is GPIO33.
- See `wiringGuide.md` for the full grounding/driver circuit.
