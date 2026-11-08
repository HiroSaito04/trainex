# TRAINEX — Individual SVG control hit targets and help layout

This revision updates only the 2D simulator's clickable hit geometry, component descriptions, and information layout. The original exported SVG and 3D/ESP32 resources are **not edited**.

## What changed

- New per-component SVG IDs are mapped in `packages/simulator-2d/src/core/cabSvgLayers.js` (`CAB_HIT_LAYERS`). The corresponding labels, descriptions and supported commands are in `packages/simulator-2d/src/config/consoleParts.js` (`CAB_PARTS`).
- Individual clickable regions were added for six bypass/rescue switches, security brake, driver key, reversing handle, horn, cab/mode selectors, seven electrical controls, five gauges/indicator controls, the remote departure indicator cluster, six radio buttons and the radio status screen.
- The specific `*_DESIGN` groups are preferred over their enclosing boards. Larger panel targets are rendered behind smaller controls to prevent intercepting button clicks. The interaction shapes are transparent, keyboard-focusable and derived from the existing Figma SVG group bounds at runtime.
- Normal view: guide and component information are **cards below the simulator**, not floating on the artwork. In expanded fullscreen: they are **overlay notification toasts**. Both can be hidden independently using `Guide On/Off` and `Explanations On/Off` buttons in the existing in-frame toolbar.
- The guide and component information use the same selection state, so closing one does not dismiss the other. Regular component cards persist until closed; fullscreen component notices expire after 8.5 seconds.
- Existing master-controller, door, security-brake, vigilance and TMS emergency-release command paths are unchanged.

## Current export: seven newer `_DESIGN` IDs not present

The currently supplied original SVG (SHA-256 `f4c051a8b3c3867b06264f2a87639249324396d0b97afc1d191e72e970b755ab`) has **parent Figma group IDs**, but does **not** contain the newly named seven bypass `_DESIGN` groups:

| Preferred Figma hit ID | Fallback in this SVG |
| --- | --- |
| `ATP BYPASS SWITCH_DESIGN` | `ATP BYPASS SWITCH` |
| `SPEEDMETER/ZERO SPEED BYPASS SWITCH_DESIGN` | `SPEEDMETER/ZERO SPEED BYPASS SWITCH` |
| `ALL DOORS CLOSED BYPASS SWITCH_DESIGN` | `ALL DOORS CLOSED BYPASS SWITCH` |
| `TCMS BYPASS SWITCH_DESIGN` | `TCMS BYPASS SWITCH` |
| `DRIVER SAFETY DEVICE BYPASS SWITCH_DESIGN` | `DRIVER SAFETY DEVICE BYPASS SWITCH` |
| `MAIN RESERVOIR PRESSURE BYPASS SWITCH_DESIGN` | `MAIN RESERVOIR PRESSURE BYPASS SWITCH` |
| `BYPASS_SWITCHES_BOARD_DESIGN` | `BYPASS_SWITCHES_BOARD` |

**No SVG shapes or IDs were added, deleted, or renamed.** If you export the newest Figma version with `Include id attribute` enabled, replace **both** SVG copies:

1. `packages/simulator-2d/src/assets/TRAINEX-Driver-Cab-2D.svg`
2. `apps/web/public/models/2d/trainex-driver-cab.svg`

The runtime will automatically use the new `_DESIGN` groups whenever those exact IDs are present. Verify that the new export has the same root 8784 × 4215 viewBox, otherwise hit-region coordinates and the master-handle calibration must be reviewed.

## Control behavior

**Sends real TRAINEX engine commands:** master handle, left/right ENABLE/OPEN/CLOSE, vigilance acknowledgement, security brake, and TMS emergency-brake release.

**Displays information only:** radio, electrical and bypass controls, reverser, cab/mode selectors and other items that the engine has no corresponding command for. An informational hit target must never silently bypass a real train protection or trigger an unrelated function.

## Testing and deployment

- `npm run test:revision` — current engine, named SVG layer and individual hit-layer tests (14 tests passed in this environment).
- `npm run build --workspace=./apps/web` — run after a **fresh Linux/macOS/Windows dependency installation**. The inherited attached `node_modules` contains missing platform-native Rollup dependencies in this environment, so the production build could not be verified here.
- Browser smoke test needed: selecting each of the new buttons, clicking a small button in a larger panel, selecting a bypass control, switching Guide and Explanations on/off, fullscreen modal placement, door controls and emergency-brake interaction, and 2D display alignment.

This source package has **not** been deployed to Vercel.
