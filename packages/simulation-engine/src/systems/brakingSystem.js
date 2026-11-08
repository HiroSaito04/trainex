const BRAKE_TARGETS=Object.freeze({B1:0.166667,B2:0.333333,B3:0.5,B4:0.666667,B5:0.833333,B6:1,B7:1.166667});
export function serviceBrakeAcceleration(state,dynamics){
 const target=BRAKE_TARGETS[state.masterHandle];
 if(target==null || state.speed<=0)return 0;
 return -Math.min(target,dynamics.serviceBrakeDecelerationMps2);
}

/** Pressure indication is illustrative, not a verified NSCR pneumatic calibration.
 * Application and release timing are approximated independently of train kinematics.
 */
export function advanceBrakePressure(state, seconds, dynamics) {
  const brakeNotch=/^B([1-7])$/.exec(state.masterHandle);
  const target=state.emergencyBrake&&!state.emergencyBrakeReleasing?1:
    state.emergencyBrakeReleasing?0:brakeNotch?Number(brakeNotch[1])/7:0;
  const previous=state.brakePressureRatio ?? 0;
  const increasing=target>previous;
  const duration=increasing
    ?(state.emergencyBrake?dynamics.emergencyApplicationSeconds:dynamics.serviceApplicationSeconds)
    :(state.emergencyBrakeReleasing?dynamics.emergencyReleaseSeconds:dynamics.serviceReleaseSeconds);
  const increment=seconds / duration;
  const ratio=increasing?Math.min(target,previous+increment):Math.max(target,previous-increment);
  return {...state,brakePressureRatio:ratio,
    brakeCylinderPressureKpa:ratio*dynamics.referenceBrakeCylinderKpa,
    brakePipePressureKpa:(1-ratio)*dynamics.referenceBrakePipeKpa};
}
