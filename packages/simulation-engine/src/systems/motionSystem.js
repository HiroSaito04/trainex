import {tractionAcceleration} from './tractionSystem.js';
import {coastingAcceleration} from './coastingSystem.js';
import {serviceBrakeAcceleration} from './brakingSystem.js';
import {emergencyBrakeAcceleration} from './emergencyBrakeSystem.js';
export function advanceMotion(state,dt,dynamics,rules){
 const prev=state.speed/3.6;
 let target=0;
 if(state.emergencyBrake)target=emergencyBrakeAcceleration(state,dynamics);
 else if(/^B[1-7]$/.test(state.masterHandle))target=serviceBrakeAcceleration(state,dynamics);
 else if(/^P[1-4]$/.test(state.masterHandle)&&(!rules.requireDoorsClosedForTraction||state.allDoorsClosed))target=tractionAcceleration(state,dynamics,rules);
 else target=coastingAcceleration(state,dynamics);
 // Jerk applies to traction and service braking, never compromises emergency effort.
 let accel=target;
 if(!state.emergencyBrake){
  const delta=dynamics.jerkLimitMps3*dt;
  accel=Math.max(state.accelerationMps2-delta,Math.min(state.accelerationMps2+delta,target));
 }
 const speed=Math.max(0,Math.min(dynamics.maxSpeedKmh/3.6,prev+accel*dt));
 const traveled=(prev+speed)*0.5*dt;
 return {...state,speed:speed*3.6,accelerationMps2:(speed-prev)/dt,distanceMeters:state.distanceMeters+traveled};
}
