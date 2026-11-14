import { useEffect, useState } from "react";
import {
  connectHardware,
  disconnectHardware,
} from "../../integrations/hardwareAdapter.js";
import { useHardwareStatus } from "../../context/useHardwareStatus.js";
import { useTrainState } from "../../context/useTrainState.js";

export default function PairingPanel() {
  const { status, method, error: hardwareError } = useHardwareStatus();
  const { sessionId } = useTrainState();
  const [endpoint, setEndpoint] = useState(
    import.meta.env.VITE_TRAINEX_RELAY_URL ?? "",
  );
  const [pairingCode, setPairingCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "connected") setPairingCode("");
  }, [status]);

  function connect(event) {
    event.preventDefault();
    try {
      setError("");
      connectHardware({ endpoint, sessionId, pairingCode });
      // Retain the code on failure so the user can retry; clear only on success.
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
      <p>
        Optional Wi-Fi/WSS connection. Start a simulation session first and use
        a separately deployed authenticated relay. For direct USB-C, use the
        panel beside this one.
      </p>
      <form className="form-stack" onSubmit={connect}>
        <label>
          Secure WebSocket endpoint
          <input
            type="url"
            placeholder="wss://relay.example.com/ws"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            required
          />
        </label>
        <label>
          Active simulation session ID
          <input value={sessionId ?? "Start a session first"} readOnly />
        </label>
        <label>
          Pairing code
          <input
            type="password"
            value={pairingCode}
            onChange={(e) => setPairingCode(e.target.value)}
            placeholder="One-time pairing code"
            autoComplete="off"
            required
          />
        </label>
        <div className="action-row">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              !sessionId || status === "connecting" || status === "connected"
            }
          >
            Connect
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={disconnectHardware}
            disabled={method !== "websocket" || status === "disconnected"}
          >
            Disconnect
          </button>
        </div>
        {(error || hardwareError) && (
          <p className="feedback-error" role="alert">
            {error || hardwareError}
          </p>
        )}
      </form>
      <p className="tiny-note">
        A compatible ESP32 firmware and authenticated WebSocket relay are
        required for hardware pairing.
      </p>
    </section>
  );
}
