
import PageHeader from "../components/common/PageHeader.jsx";

import PairingPanel from "../components/hardware/PairingPanel.jsx";

import ConnectionStatus from "../components/hardware/ConnectionStatus.jsx";

export default function HardwarePage() {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="ESP32 HARDWARE"
        title="Physical Console Connection"
        description="Monitor and connect optional TRAINEX hardware without making the website dependent on the console."
      />

      <div className="card-grid two-cols align-start">
        <PairingPanel />

        <ConnectionStatus />
      </div>

      <p className="notice spaced">
        Internet-based hardware requires a
        separately deployed, authenticated
        WebSocket relay. This page does not
        deploy the relay or ESP32 firmware.
        The browser simulation must also
        have its runtime connected before
        physical inputs can change train state.
      </p>
    </div>
  );
}
