# TRAINEX revision — 13-detent control and updated cab (2026-11-08)

- Uploaded vector `DRIVERS_CABIN_DESK.svg` is now the 2D source asset. Figma groups remain in the SVG.
- Top-row train doors on the TCMS diagram are LEFT; bottom-row are RIGHT. Indicators are sourced from the engine door states and the color legend (white closed, yellow open, red fault).
- Left and right doors operate independently. Door enabling is required, and opening is interlocked with standstill and neutral master handle. Traction requires BOTH sides closed.
- Vigilance-related automatic brake logic is removed from the running simulation. The labeled vigilance button/indicator still appear in the supplied artwork as **non-functional artwork**.
- The distinct release command is `EMERGENCY_BRAKE_RELEASE` (not reset); available after standstill and N. Emergency brake can be activated by the EB detent and the security brake command. Release models a 3-second release interval. The in-cab **EB Release** button is separate from the red **Security Brake** actuator, which still applies emergency braking.
- 13 master positions P1–P4, N, B1–B7, EB implemented in the authoritative simulation engine. Notch values match supplied acceleration targets. Max speed 120 km/h, jerk limit 1.1 m/s³ (emergency exempt). Above 30 km/h the traction curve is **not calibrated**.
- Hardware tab has Start/Pause/Resume/Reset/End controls for the **shared session**, allowing pairing from that page.
- **Hardware migration required:** existing ESP32 eight-contact rotary firmware does not physically sense 13 positions. Use AS5600 or equivalent, reserve GPIO21 SDA/GPIO22 SCL, and calibrate all 13 detents. Do not wire the old eight-contact GPIO21/22 rotary inputs at the same time as I2C.
- The legacy 3D model remains a separate art asset. 3D mappings have the new control names but mesh positions and the lever's 13 physically distinct detents still require Blender/model revision.
- Noninteractive controls shown in the supplied artwork remain inspection-only. This simulator is for training, not operation of real trains.

- The ESP32 encoder now sends Boolean `value:true` for button presses, matching the relay validator. Master-handle inputs remain string values.
- Retired tests asserting the original eight-detent SVG layout and vigilance are kept in `legacy/` folders; new active tests exercise the requested behavior.
- Local Vite production build has **not** been verified because the supplied Windows npm dependencies do not include Linux native Rollup/Esbuild binaries. JS/JSX syntax validation and Node runtime tests were performed.
