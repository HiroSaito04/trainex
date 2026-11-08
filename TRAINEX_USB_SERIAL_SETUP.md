# TRAINEX — Connect ESP32 to the website using USB-C (no Wi-Fi)

This integration uses the **existing** PlatformIO `esp32dev` / bench firmware and its seven button events.
**No firmware upload is needed** if you already see `BUTTON ... (bench)` in PlatformIO Serial Monitor.

## Architecture

7 buttons → ESP32-WROOM-32 → USB-C serial (115200 baud) → Chrome / Edge Web Serial →
TRAINEX `hardwareAdapter` → `forwardHardwareInput()` → existing InputManager → authoritative Train Simulation Engine → 2D / 3D / TMS.

No WebSocket relay, Wi-Fi password, backend server, or Bluetooth is involved in USB mode.

## Local development setup

1. Copy these updated website files into your repo, preserving their paths:
   - `apps/web/src/integrations/parseTrainexUsbLine.js` **new**
   - `apps/web/src/integrations/UsbSerialConnection.js` **new**
   - `apps/web/src/integrations/hardwareAdapter.js` **updated**
   - `apps/web/src/components/hardware/UsbSerialPanel.jsx` **new**
   - `apps/web/src/components/hardware/PairingPanel.jsx` **updated**
   - `apps/web/src/pages/HardwarePage.jsx` **updated**
   - `apps/web/tests/usbSerial.test.mjs` **new tests**
2. From the repository root: `npm install` (if needed), then `npm run dev`.
3. Open the local Vite URL (`http://localhost:5173` by default) in **desktop Chrome or Edge**.
4. Connect the ESP32 to your laptop via a **data-capable USB-C cable**.
5. **Close the PlatformIO Serial Monitor** (Ctrl+C) and any Arduino serial-monitor app. COM5 cannot be held by two programs simultaneously.
6. On the website, go to **Hardware → Session Controls → Start**.
7. Click **Connect USB**, choose your ESP32 serial device in the browser permission dialog, and approve it.
8. Press Left Door Enable (GPIO18), then Left Door Open (GPIO26). Watch `Last control` in the connection monitor; TRAINEX's existing door safety rules decide if the command is accepted.
9. Navigate to the 2D or 3D simulator in the **same browser tab**, with that session running. The connection belongs to the tab; page reload closes it.

## To deploy on Vercel

1. Commit these website files to the same Git repository that Vercel deploys.
2. Push to `main` (or your configured deployment branch).
3. Wait for the Vercel deployment to finish, then reload the HTTPS TRAINEX site.
4. Follow steps 4–9 above on the laptop physically connected to the ESP32.

This ZIP does not automatically update the live website. New USB code must be deployed.

## Expected serial messages from your current firmware

- `BUTTON DOOR_ENABLE_LEFT true (bench)` → GPIO18
- `BUTTON DOORS_OPEN LEFT (bench)` → GPIO26
- `BUTTON DOORS_CLOSE LEFT (bench)` → GPIO27
- `BUTTON DOOR_ENABLE_RIGHT true (bench)` → GPIO19
- `BUTTON DOORS_OPEN RIGHT (bench)` → GPIO25
- `BUTTON DOORS_CLOSE RIGHT (bench)` → GPIO33
- `BUTTON VIGILANCE_ACKNOWLEDGE true (bench)` → GPIO23

The browser ignores all other lines (startup logs, pin listing, unrecognized commands). It assigns the active session ID and monotonically increasing sequence numbers rather than trusting serial-supplied identity fields.

## Diagnostics

- **Connect USB unavailable**: start a simulation session first and use desktop Chrome or Edge in HTTPS/localhost.
- **No serial device in picker**: verify USB-C data cable, USB driver, and Windows Device Manager. Close PlatformIO Serial Monitor first.
- **Failed to open port / busy**: close Serial Monitor and disconnect any other tab using the port. A fresh browser tab may require reselecting the port.
- **Connected but button not reflected in train state**: see the Hardware page's `Last control`. `Last control` updating means serial input reached the browser, but TRAINEX engine can legitimately reject a door request due to its interlocks (e.g., incorrect enable, train in motion).
- **Device offline after loading previous deployed site**: make sure your changed files were committed to the web repository and deployed, then reload the page.
- **Page refresh / browser tab closes**: USB is disconnected by design; click Connect USB again after starting a session.
- **Trying to re-open PlatformIO Serial Monitor**: click Disconnect USB on TRAINEX first.
- **Phone / mobile PWA**: serial support and USB driver behavior vary by platform; this integration targets desktop Chrome/Edge for the current ESP32 prototype.

## Test without hardware

From the repo root:

```
node --test apps/web/tests/usbSerial.test.mjs
```

The tests cover all seven commands, invalid data, split USB packets, session-binding, USB disconnect, and command forwarding to TRAINEX's runtime.

## Security

USB mode is intentionally local and requires permission from the person using the computer. The website cannot request a device at page load and cannot read COM5 while another program owns it. WebSocket relay mode is unchanged and still requires its own authentication and pairing. Do not put Wi-Fi passwords or relay secrets in Vite/browser source.
