> **HISTORICAL BASE REVISION:** The subsequent named-layer integration (see `TRAINEX_FIGMA_LAYER_BINDING_2026-11-08.md`) reactivates vigilance and binds the new SVG IDs. This older section describes the previous ZIP.

# TRAINEX revision — 2026-11-08

This update replaces the 2D SVG with the user's **unaltered** `DRIVERS_CABIN_DESK.svg` and reprojects component hotspots to its new 8784×4215 artwork. Layout/styling outside the simulator was left unchanged.

## Implemented
- 13 master-handle states: EB, B1–B7, N, P1–P4; acceleration/deceleration constants from supplied table.
- No automatic vigilance timers, buzzer, vigilance button commands, or vigilance HUD widgets. The user-supplied SVG still visually contains the original vigilance button/lamp **because the artwork was not redrawn**; both are nonfunctional.
- Separate left/right door states and enable commands. TMS upper door graphic reflects LEFT doors; lower graphic RIGHT doors; colors follow closed/open/fault/unknown legend.
- Illuminated indicators track simulation state (all doors closed/open, door enables, emergency brake). No fabricated departure authorization.
- The brake-cylinder and brake-pipe gauges now respond to brake commands with time-ramped illustrative values. Their 350/500 kPa endpoints are visual training approximations, **not verified NSCR pressure settings**.
- Security Brake button activates emergency braking. Emergency Brake Release on the TMS requests release at standstill with master at N, then counts three seconds. No independent EB Reset button/command.
- Hardware tab can Start, Pause, Resume, Reset Session, End the same session used by 2D/3D and the ESP32 pairing page.
- ESP32 PlatformIO GPIO25 now reports `EMERGENCY_BRAKE_RELEASE`; no GPIO23 vigilance dispatch. GPIO26/27 operate the selected enabled door bank. GPIO32 polling is disabled to prevent ghost horn signals.

## Constraints / physical implementation
- The uploaded SVG uses path outlines for printed labels, so existing labels remain vector graphics; live overlays are additional scalable SVG geometry.
- Original GLB is unchanged; it has only eight physically-modeled detent meshes. The engine supports 13; the 3D mesh must be updated separately to show all 13 mechanically.
- The ESP32 prototype originally reads 8 digital master-handle contacts. For the 13-position AS5600 master handle, firmware now supports a compile-time AS5600 mode; activate it only after rewiring and calibration. Do not connect an AS5600 directly to the old rotary GPIO mapping.
- A hardware door-enable input is not yet physically wired. Use the 2D left/right ENABLE buttons before using GPIO26/27 door commands.
- Only the user's supplied 2D SVG is replaced; the 3D model design stays unchanged.
- Train traction performance above 30 km/h is provisional because the source supplies no traction curve above that speed.
- No external relay was deployed and no real ESP32 was connected in this environment; test pairing with a running secure relay on actual hardware.

## Local test commands
`npm install` then `npm run dev` from project root. Verify 2D session Start and Hardware-tab Start use the same session ID; monitor both left/right train doors separately.

## Validation
- Run `npm run test:revision` for current engine/input/display behavior tests (legacy tests in this ZIP may assert the prior eight-notch and vigilance architecture).
- Browser production build was not run in the sandbox because the uploaded `node_modules` contained Windows-targeted native packages, whereas this environment is Linux. Run `npm install` and `npm run build --workspace=./apps/web` on your machine or CI to verify the production build before deployment.
- After deployment, visually verify door indication alignment and active/idle indicator states across desktop and mobile widths.
