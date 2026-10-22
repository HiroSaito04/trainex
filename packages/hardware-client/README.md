# @trainex/hardware-client

Browser-side ESP32 bridge. Use `HardwareClient` with the SAME `InputManager` used by the TRAINEX 2D/3D simulators. The simulation engine remains authoritative.

- WSS is supported when a **separately deployed persistent relay** is available. Supply a short-lived, backend-issued browser token at runtime; NEVER bundle relay secrets in Vite environment variables.
- Web Serial is an alternative for direct USB on compatible desktop Chromium with an explicit user gesture to select the port. Browser origin must be HTTPS or localhost.
- Vercel serves the browser app; it does **not** host the persistent WebSocket relay.
- The client rejects wrong sessions, unpaired devices, unknown inputs and replayed sequences before calling InputManager.
- No Bluetooth is required or used.

Expected input (after pairing): `{"type":"input","sessionId":"...","deviceId":"trainex-esp32-01","sequence":14,"controlId":"MASTER_HANDLE","value":"B2"}`.

See root `TRAINEX-HARDWARE-TRAINING-INTEGRATION.md` for wiring and integration.
