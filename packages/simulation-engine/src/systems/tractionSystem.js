const POWER_FACTORS=Object.freeze({P1:0.25,P2:0.5,P3:0.75,P4:1});
export function tractionAcceleration(state,dynamics,rules){
 const factor=POWER_FACTORS[state.masterHandle];
 if(factor==null || state.emergencyBrake)return 0;
 if(rules.requireDoorsClosedForTraction && !state.allDoorsClosed)return 0;
 return dynamics.tractionAccelerationMps2*factor;
}
