# Browser integration

`trainexRelayClient.js` is an example client for the explicitly enabled **prototype pairing-code** mode. It uses exactly the three fields shown by TRAINEX: `wss://` endpoint, session ID, pairing code. Device ID is optional and is automatically resolved by the relay when the pairing code uniquely identifies the device.

Import `connectTrainexRelay`, then on the existing UI's Connect action:

```js
const relay=connectTrainexRelay({
  endpoint, sessionId, pairingCode,
  onStatus: status => setConnectionStatus(status),
  onInput: message => {
    // IMPORTANT: wire to the existing centralized hardware-input adapter.
    // Do not mutate train simulation engine state directly here.
    console.log('Hardware input',message.controlId,message.value);
  },
  onError: message => console.error(message)
});
// On Disconnect: relay.disconnect();
```

**Not yet an automatic patch to `apps/web`:** the uploaded archive contains only `services/`, so the existing UI source and input-manager API were not supplied. You must integrate this example or confirm your current UI implements the same handshake. `HORN` and `VIGILANCE_ACK` will reach the browser, but TRAINEX app handlers must support those IDs for effects to occur.

For stronger deployments, replace the prototype browser auth with a trusted backend that authorizes the active session and issues short-lived credentials. The user-entered pairing code alone cannot prove simulation session ownership.

## Verify the relay without changing TRAINEX web app

Open the VS Code terminal at the repository root, then run:

```powershell
node .\integration-examples\browser-relay-client\demo-server.js
```

Open `http://localhost:5173`. Enter your public `wss://.../ws` relay endpoint, a test session ID (`trainex_test_01`), and the real private pairing code from relay configuration. First confirm ESP32 Serial Monitor reports `Device authenticated`. Click **Connect** and move the master handle. The test page should show `paired` and display incoming JSON events. This proves the relay and firmware handshake. It **does not** prove the Vercel TRAINEX UI has its own input-manager adapter. Add `http://localhost:5173` to `RELAY_ALLOWED_ORIGINS` for local testing, remove that origin from production once testing is complete.
