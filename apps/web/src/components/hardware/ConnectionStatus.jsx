
import {
  useHardwareStatus,
} from "../../context/useHardwareStatus.js";

export default function ConnectionStatus() {
  const {
    status,
    deviceId,
    method,
    lastMessage,
    error,
  } = useHardwareStatus();

  return (
    <section
      className="panel card-stack"
      aria-live="polite"
    >
      <div className="section-heading">
        <p className="eyebrow">
          CONNECTION MONITOR
        </p>

        <h2>ESP32 Status</h2>
      </div>

      <p>
        <span
          className={`status-badge status-${status}`}
        >
          {status}
        </span>
      </p>

      <dl className="key-values">
        <div>
          <dt>Transport</dt>
          <dd>
            {method ?? "Not connected"}
          </dd>
        </div>

        <div>
          <dt>Device</dt>
          <dd>
            {deviceId ?? "—"}
          </dd>
        </div>

        <div>
          <dt>Last control</dt>
          <dd>
            {lastMessage ?? "—"}
          </dd>
        </div>
      </dl>

      {error && (
        <p
          className="feedback-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}
