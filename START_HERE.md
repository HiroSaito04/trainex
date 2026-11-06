# TRAINEX ESP32 + deployed website connection kit

Prepared from the uploaded `services.zip` while preserving the `services/realtime-relay` folder layout and adding hardware and browser integration examples.

## Merge into your TRAINEX GitHub clone

Copy these folders into the corresponding repository root folders (merge, do not delete `apps/web` or `packages`):

- `services/realtime-relay/` — updated WebSocket relay (keeps source modules, tests, config)
- `hardware/esp32/` — PlatformIO project for physical ESP32 controls
- `integration-examples/browser-relay-client/` — website browser connector example

**Do not overwrite your entire `hardware/esp32` folder without backing up prior pin and firmware work.** The provided wiring is an example to adapt to actual components.

### Stage 1 — relay

1. In the TRAINEX root folder: `npm.cmd install`.
2. Run `npm.cmd test --workspace=@trainex/realtime-relay`.
3. Generate two different long random credentials using PowerShell's `node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))"` twice.
4. Add variables from `services/realtime-relay/.env.example` to Railway (or your WebSocket host) and put the generated values into `RELAY_DEVICES_JSON`.
5. Deploy as persistent Node service; verify `https://<relay-host>/health`, and get `wss://<relay-host>/ws`.

### Stage 2 — ESP32 (VS Code + PlatformIO)

1. Copy `hardware/esp32/include/Secrets.example.h` to `Secrets.h`, customize values.
2. Check TLS root certificate against relay host; the bundle includes ISRG Root X1 as an example.
3. Wire GPIO contacts to GND according to `hardware/esp32/README.md`.
4. Upload and open Serial Monitor (115200). Wait for `Device authenticated`.

### Stage 3 — quick relay-only browser test

With the ESP32 authenticated, run `node .\integration-examples\browser-relay-client\demo-server.js` from the repository root and open `http://localhost:5173`. Enter public WSS relay endpoint, a test session ID and the configured pairing code. Press Connect; the page should change to `paired` and show incoming hardware events. This requires `http://localhost:5173` in your relay allowlist (development only).

### Stage 4 — deployed TRAINEX browser

1. Start a session on `https://trainex-six.vercel.app/`.
2. Enter the relay WSS endpoint, actual session ID, and matching pairing code into TRAINEX's Connect form.
3. If the existing UI's handshake differs, integrate `integration-examples/browser-relay-client/trainexRelayClient.js` into its frontend hardware adapter and redeploy Vercel. The uploaded ZIP did not contain `apps/web`, so frontend compatibility could **not** be verified here.
4. Test master-handle changes and the door controls. HORN/VIGILANCE_ACK also need frontend integration to affect the simulator.

## Important limitations

- The bundle is a **prototype integration**; no credentials, live relay host, or real ESP32 board are included. No external service was deployed or contacted.
- Browser pairing-code authorization is enabled only when explicitly configured. It does NOT authenticate simulator session ownership; use a real backend-issued session token before unrestricted public usage.
- All communication over public networks must use TLS WSS with the correct root CA; do not use `setInsecure()`.
- No Bluetooth or LED circuitry is used. 2.4 GHz ESP32 Wi-Fi is compatible with a dual-band router.
