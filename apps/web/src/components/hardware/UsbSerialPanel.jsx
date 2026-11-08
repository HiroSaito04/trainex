import {useState} from "react";
import {connectUsbHardware, disconnectHardware} from "../../integrations/hardwareAdapter.js";
import {useHardwareStatus} from "../../context/useHardwareStatus.js";
import {useTrainState} from "../../context/useTrainState.js";

export default function UsbSerialPanel() {
  const {status, method, lastMessage, error: connectionError} = useHardwareStatus();
  const {sessionId} = useTrainState();
  const [error, setError] = useState("");
  const usbActive = method === "usb-serial";
  const busy = usbActive && (status === "connecting" || status === "connected");

  async function connect() {
    setError("");
    try {
      // Must be called directly from this click (browser user activation).
      await connectUsbHardware();
    } catch (cause) {
      setError(cause?.name === 'NotFoundError' ? 'Serial port selection was cancelled.' : cause?.message ?? 'USB connection failed.');
    }
  }
  async function disconnect() {
    setError("");
    await disconnectHardware();
  }

  return (
    <section className="panel card-stack" aria-label="Direct USB serial connection">
      <div className="section-heading">
        <p className="eyebrow">NO WI-FI OR RELAY REQUIRED</p>
        <h2>Connect using USB-C</h2>
      </div>
      <p>Use your seven-button ESP32 bench firmware directly with TRAINEX on this computer.</p>
      <p className="tiny-note">Start a simulation session, close PlatformIO Serial Monitor, then click Connect USB. Select your ESP32 serial device (COM5 on your computer).</p>
      <div className="action-row">
        <button type="button" className="btn btn-primary" disabled={!sessionId || busy || (status !== "disconnected" && status !== "error")} onClick={connect}>
          {usbActive && status === "connecting" ? "Selecting ESP32…" : "Connect USB"}
        </button>
        <button type="button" className="btn btn-secondary" disabled={!usbActive || status === "disconnected"} onClick={disconnect}>
          Disconnect USB
        </button>
      </div>
      <p className="tiny-note" role="status">USB: {usbActive ? status : "not connected"}{usbActive && lastMessage ? ` · Last: ${lastMessage}` : ""}</p>
      {(error || (usbActive && connectionError)) && <p className="feedback-error" role="alert">{error || connectionError}</p>}
      <p className="tiny-note">Supported: desktop Chrome or Edge on HTTPS/localhost. The browser's permission prompt is required. This does not work while another program holds the same COM port.</p>
    </section>
  );
}
