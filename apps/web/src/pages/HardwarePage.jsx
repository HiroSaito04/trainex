import "../assets/styles/pages/hardware.css";

import PageHeader from "../components/common/PageHeader.jsx";

import PairingPanel from "../components/hardware/PairingPanel.jsx";
import UsbSerialPanel from "../components/hardware/UsbSerialPanel.jsx";

import HardwareSessionControls from "../components/hardware/HardwareSessionControls.jsx";

import ConnectionStatus from "../components/hardware/ConnectionStatus.jsx";

export default function HardwarePage() {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="ESP32 HARDWARE"
        title="Physical Console Connection"
        description="Monitor and connect optional TRAINEX hardware without making the website dependent on the console."
      />

      <HardwareSessionControls />

      <div className="card-grid two-cols align-start">
        <UsbSerialPanel />

        <PairingPanel />
      </div>

      <ConnectionStatus />

      <p className="notice spaced">
        Direct USB mode requires Chrome/Edge serial-port permission and a closed PlatformIO Serial Monitor.
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
