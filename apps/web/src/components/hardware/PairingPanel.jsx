import { useState } from "react";
import { connectHardware, disconnectHardware } from "../../integrations/hardwareAdapter.js";
import { useHardwareStatus } from "../../context/useHardwareStatus.js";
import { useTrainState } from "../../context/useTrainState.js";

export default function PairingPanel() {
  const { status } = useHardwareStatus();
  const { sessionId } = useTrainState();
  const [endpoint, setEndpoint] = useState(import.meta.env.VITE_TRAINEX_RELAY_URL ?? "");
  const [pairingCode, setPairingCode] = useState("");
  const [error, setError] = useState("");

  function connect(event) {
    event.preventDefault();
    try {
      setError("");
      connectHardware({ endpoint, sessionId, pairingCode });
      setPairingCode("");
    } catch (err) {
      setError(err?.message ?? "Unable to start pairing.");
    }
  }

  return (
    <section className="panel card-stack">
      <div className="section-heading">
        <p className="eyebrow">OPTIONAL HARDWARE</p>
        <h2>Connect an ESP32 console</h2>
      </div>
      <p>Start a simulation session first. Connect only through a separately deployed relay that authenticates device and session pairing.</p>
      <form className="form-stack" onSubmit={connect}>
        <label>
          Secure WebSocket endpoint
          <input type="url" placeholder="wss://relay.example.com"
            value={endpoint} onChange={(e) => setEndpoint(e.target.value)} required />
        </label>
        <label>
          Active simulation session ID
          <input value={sessionId ?? "Start a session first"} readOnly />
        </label>
        <label>
          Pairing code
          <input type="password" value={pairingCode}
            onChange={(e) => setPairingCode(e.target.value)}
            placeholder="One-time pairing code" autoComplete="off" required />
        </label>
        <div className="action-row">
          <button type="submit" className="btn btn-primary"
            disabled={!sessionId || status === "connecting" || status === "connected"}>
            Connect
          </button>
          <button type="button" className="btn btn-secondary"
            onClick={disconnectHardware} disabled={status === "disconnected"}>
            Disconnect
          </button>
        </div>
        {error && <p className="feedback-error" role="alert">{error}</p>}
      </form>
      <p className="tiny-note">An ESP32 and authenticated WebSocket relay are optional and not included in these four ZIPs.</p>
    </section>
  );
}
