# TRAINEX Realtime Relay

Persistent WebSocket relay for ESP32 Wi-Fi input and browser session pairing. 

- Device authenticates using a unique per-device token. Browser authenticates using a token obtained from a trusted backend. Pairing additionally requires the configured pairing code and an active simulator session ID.
- Strict source routing: device => browser input; browser => device state feedback. Messages are validated, rate-limited, session-checked and replay-protected.
- No Bluetooth. Do not host this stateful socket server as a Vercel function.
- This is a single-process prototype. See deployment/README.md for production hardening requirements.

`npm install` at repository root; then `npm run start --workspace=@trainex/realtime-relay` (environment variables required).
