import { tractionAcceleration } from './tractionSystem.js';
import { coastingAcceleration } from './coastingSystem.js';
import { serviceBrakeAcceleration } from './brakingSystem.js';
import { emergencyBrakeAcceleration } from './emergencyBrakeSystem.js';

export function advanceMotion(state, deltaSeconds, dynamics, rules) {
  const previousSpeedMps = state.speed / 3.6;
  let acceleration = 0;
  if (state.emergencyBrake) {
    acceleration = emergencyBrakeAcceleration(state, dynamics);
  } else if (['B1','B2','B3'].includes(state.masterHandle)) {
    acceleration = serviceBrakeAcceleration(state, dynamics);
  } else if (['P1','P2','P3'].includes(state.masterHandle) && (!rules.requireDoorsClosedForTraction || state.allDoorsClosed)) {
    acceleration = tractionAcceleration(state, dynamics, rules);
  } else {
    acceleration = coastingAcceleration(state, dynamics);
  }

  const maxSpeedMps = dynamics.maxSpeedKmh / 3.6;
  const speedMps = Math.max(0, Math.min(maxSpeedMps,
    previousSpeedMps + acceleration * deltaSeconds));
  const actualAcceleration = (speedMps - previousSpeedMps) / deltaSeconds;
  const traveled = (previousSpeedMps + speedMps) * 0.5 * deltaSeconds;
  return {
    ...state,
    speed: speedMps * 3.6,
    accelerationMps2: actualAcceleration,
    distanceMeters: state.distanceMeters + traveled,
  };
}
