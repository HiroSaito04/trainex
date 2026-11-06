# TRAINEX Realtime Relay

Persistent WebSocket relay for ESP32 Wi-Fi hardware input and browser pairing.

## Local start (VS Code terminal)

From the TRAINEX repository root:

```powershell
npm.cmd install
$env:RELAY_ALLOWED_ORIGINS="http://localhost:5173,https://trainex-six.vercel.app"
$env:RELAY_ALLOW_PAIR_CODE_BROWSER_AUTH="true"
$env:RELAY_DEVICES_JSON='{"trainex-esp32-01":{"token":"YOUR_RANDOM_32_PLUS_CHAR_DEVICE_TOKEN","pairingCode":"YOUR_RANDOM_16_PLUS_CHAR_PAIRING_CODE"}}'
npm.cmd run start --workspace=@trainex/realtime-relay
```

Above credential strings are examples and will fail validation if too short or placeholder values. Generate secrets securely with `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` and use unique values in firmware + host environment. A persistent relay is required; do not deploy this to serverless functions with short-lived runtimes.

## Protocol

- Device: connect to `/ws` over WSS and send `{"type":"auth","role":"device","deviceId":"trainex-esp32-01","token":"..."}`. Relay answers `authenticated`.
- Browser prototype: connect from an allowed origin and send `{"type":"auth","role":"browser"}` (only when `RELAY_ALLOW_PAIR_CODE_BROWSER_AUTH=true`). Relay answers `authenticated`.
- Browser: send `{"type":"pair","sessionId":"actual_session_id","pairingCode":"..."}`. `deviceId` optional; unique code resolves it.
- Both get `paired` with session ID; ESP32 sends validated `input` events; relay forwards them to browser.
- Heartbeat `{ "type":"heartbeat" }` from each side every ~20 seconds. `unpair` and socket close remove the association. Browser `state_feedback` routes only to its paired device.

## Security boundaries

- The long device token stays in the physical ESP32's untracked `Secrets.h` and server environment, NEVER in the Vercel frontend bundle.
- Use HTTPS for the Vercel page and WSS for both browser and ESP32. Provision the public endpoint behind a TLS-terminating proxy.
- Pairing-code-only browser auth is for a **controlled prototype**; a private high-entropy pairing code is required. It cannot verify that the session ID is authentic to your application. For broader public access, implement backend-issued short-lived browser tokens, verified session ownership, and separate device-pairing authorization before allowing user-controlled train inputs.
- Run one relay instance; session/device mappings are stored in memory. Do not scale horizontally without a shared registry.
- No LEDs or Bluetooth are required.
