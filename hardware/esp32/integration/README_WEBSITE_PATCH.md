# Compatibility with the TRAINEX web/relay source

This hardware architecture sends existing TRAINEX hardware commands and the side-specific door values from the latest seven-button package:

- `DOOR_ENABLE_LEFT` / `DOOR_ENABLE_RIGHT`: boolean `true`.
- `DOORS_OPEN` / `DOORS_CLOSE`: string `LEFT` or `RIGHT`, *not* boolean.
- `VIGILANCE_ACKNOWLEDGE`: boolean `true`.
- `MASTER_HANDLE`: detent string when the future sensor is enabled and calibrated.

The snippets under `integration/website-patch` are copied from the user's earlier seven-button hardware package to support sites that still reject side-specific hardware door input. They are **not** a complete website and should be compared with your current repository first. Apply only if the corresponding validations are missing. The 2D SVG design and rendering are never modified by the firmware.

Before pairing a device, the relay must be configured with its authorized device ID and token, and it must terminate a verified WSS TLS connection. This firmware expects `/ws` on port 443 and a valid clock for CA validation.
