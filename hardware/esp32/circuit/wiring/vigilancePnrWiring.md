# PNR reference vigilance — physical wiring

* GPIO23 -> normally-open Vigilance Acknowledge button -> GND (internal pull-up).
* GPIO25 -> normally-open Emergency Brake Reset button -> GND.
* GPIO26/27 -> Door Open / Door Close buttons -> GND.
* Master Handle EB is still GPIO13, one of eight rotary detents (not a separate EB-activation pushbutton).
* **No physical LEDs**; warning indicator remains in the 2D/3D software dashboards.
* **GPIO32 -> passive piezo (+), piezo (-) -> GND** only for a verified low-current 3.3V-compatible piezo.
  Use a driver transistor or suitable buzzer module if its current/voltage exceeds ESP32 GPIO limits.
* The ESP32 does **not** run its own 30/32.5/35 s vigilance clock. It plays a tone only
  upon receiving `state_feedback.vigilanceBuzzer: true` from an active browser/relay link.
* Physical buzzer sound is unavailable until the browser hardware connection and feedback
  subscription are working; USB Serial Monitor output alone does not generate feedback.

Power off the board while wiring and verify all contact terminal assignments with a meter.
