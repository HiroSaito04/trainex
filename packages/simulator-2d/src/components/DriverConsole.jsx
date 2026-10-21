
import MasterControlHandle from "./controls/MasterControlHandle.jsx";

import EmergencyBrakeSwitch from "./controls/EmergencyBrakeSwitch.jsx";

import PassengerDoorControls from "./controls/PassengerDoorControls.jsx";

import FrontDisplayPanel from "./indicators/FrontDisplayPanel.jsx";

import AllDoorsClosedLamp from "./indicators/AllDoorsClosedLamp.jsx";

export default function DriverConsole({
  state,
  disabled,
  controls,
  onInspect,
}) {
  return (
    <div className="c2d-console">
      <div className="c2d-console-brand">
        <span>
          TRAIN<span>EX</span>
        </span>

        <small>
          DRIVER CONTROL DESK · 2D
        </small>
      </div>

      <div className="c2d-upper-panel">
        <FrontDisplayPanel
          state={state}
          onInspect={onInspect}
        />

        <AllDoorsClosedLamp
          allDoorsClosed={state.allDoorsClosed}
          onInspect={onInspect}
        />
      </div>

      <div className="c2d-lower-panel">
        <MasterControlHandle
          value={state.masterHandle}
          disabled={disabled}
          onChange={controls.setMasterHandle}
          onInspect={onInspect}
        />

        <PassengerDoorControls
          doorState={state.doorState}
          disabled={disabled}
          onOpen={controls.openDoors}
          onClose={controls.closeDoors}
          onInspect={onInspect}
        />

        <EmergencyBrakeSwitch
          active={state.emergencyBrake}
          disabled={disabled}
          onActivate={
            controls.activateEmergencyBrake
          }
          onReset={
            controls.resetEmergencyBrake
          }
          onInspect={onInspect}
        />
      </div>

      <div className="c2d-console-bottom">
        <span>
          TRAINEX SIMULATION INTERFACE
        </span>

        <span>
          EDUCATIONAL USE ONLY
        </span>
      </div>
    </div>
  );
}
